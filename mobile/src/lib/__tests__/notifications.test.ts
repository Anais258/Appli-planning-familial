import { reminderMoment, toExpoWeekday } from "../notifications";

describe("toExpoWeekday", () => {
  it("maps the app's Lun..Dim convention onto Expo's Dim..Sam (1..7)", () => {
    expect(toExpoWeekday(0)).toBe(2); // Lun -> 2
    expect(toExpoWeekday(6)).toBe(1); // Dim -> 1
    expect(toExpoWeekday(5)).toBe(7); // Sam -> 7
  });
});

describe("reminderMoment", () => {
  it("fires 10 minutes before the task, same day", () => {
    expect(reminderMoment(2, "09:00")).toEqual({ weekday: 2, hour: 8, minute: 50 });
  });

  it("rolls onto the previous weekday for an early-morning task", () => {
    expect(reminderMoment(0, "00:05")).toEqual({ weekday: 6, hour: 23, minute: 55 });
  });

  it("wraps Lundi back to Dimanche", () => {
    expect(reminderMoment(0, "00:00")).toEqual({ weekday: 6, hour: 23, minute: 50 });
  });
});
