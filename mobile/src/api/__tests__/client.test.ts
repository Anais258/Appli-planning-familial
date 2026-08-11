import { api, ApiError } from "../client";
import { useAuthStore } from "../../state/authStore";

function jsonResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body ?? {},
  } as Response;
}

function noContentResponse() {
  return {
    status: 204,
    json: async () => ({}),
  } as Response;
}

describe("api client request()", () => {
  const initialState = useAuthStore.getState();

  beforeEach(() => {
    useAuthStore.setState(initialState, true);
    global.fetch = jest.fn();
  });

  it("attaches the Authorization header when an access token is present", async () => {
    useAuthStore.setState({ accessToken: "token-123" });
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await api.get("/members");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer token-123");
  });

  it("omits the Authorization header when there is no access token", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await api.get("/members");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("returns undefined for a 204 response", async () => {
    useAuthStore.setState({ accessToken: "token-123" });
    (global.fetch as jest.Mock).mockResolvedValueOnce(noContentResponse());

    await expect(api.delete("/tasks/1")).resolves.toBeUndefined();
  });

  it("throws an ApiError with the server's message on a non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(400, { error: "Requête invalide" }));

    await expect(api.get("/tasks")).rejects.toMatchObject({ status: 400, message: "Requête invalide" } satisfies Partial<ApiError>);
  });

  it("on a 401 with a refresh token, refreshes once and retries the request", async () => {
    useAuthStore.setState({ accessToken: "expired", refreshToken: "refresh-1", refresh: jest.fn().mockResolvedValue(true) });
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(401)).mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await api.get<{ ok: boolean }>("/tasks");

    expect(result).toEqual({ ok: true });
    expect(useAuthStore.getState().refresh).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("signs out and throws when the refresh itself fails", async () => {
    const signOut = jest.fn();
    useAuthStore.setState({ accessToken: "expired", refreshToken: "refresh-1", refresh: jest.fn().mockResolvedValue(false), signOut });
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(401));

    await expect(api.get("/tasks")).rejects.toMatchObject({ status: 401 });
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("does not attempt a refresh when there is no refresh token", async () => {
    useAuthStore.setState({ accessToken: "expired", refreshToken: null });
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(401, { error: "Missing bearer token" }));

    await expect(api.get("/tasks")).rejects.toMatchObject({ status: 401 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
