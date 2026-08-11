import { categoryTagVariant, formatDuration, jsDayToWeekday, priorityLabel, todayWeekday } from "../weekdays";

describe("jsDayToWeekday", () => {
  it("maps JS Sun-first days onto the Lun-first 0..6 convention", () => {
    expect(jsDayToWeekday(1)).toBe(0); // Monday
    expect(jsDayToWeekday(0)).toBe(6); // Sunday
    expect(jsDayToWeekday(3)).toBe(2); // Wednesday
  });
});

describe("todayWeekday", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("derives from the current date using the same 0=Lun convention", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T12:00:00")); // a Wednesday
    expect(todayWeekday()).toBe(2);
  });
});

describe("categoryTagVariant", () => {
  it("maps known categories to their tag variant", () => {
    expect(categoryTagVariant("École")).toBe("accent");
    expect(categoryTagVariant("Santé")).toBe("outline");
    expect(categoryTagVariant("Maison")).toBe("neutral");
    expect(categoryTagVariant("Loisirs")).toBe("neutral");
  });
});

describe("priorityLabel", () => {
  it("returns a French label per priority", () => {
    expect(priorityLabel("high")).toBe("Priorité haute");
    expect(priorityLabel("medium")).toBe("Priorité moyenne");
    expect(priorityLabel("low")).toBe("Priorité basse");
  });
});

describe("formatDuration", () => {
  it("formats minutes under an hour as-is", () => {
    expect(formatDuration(15)).toBe("15 min");
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats whole hours without a minutes suffix", () => {
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours plus minutes, zero-padded", () => {
    expect(formatDuration(90)).toBe("1h30");
    expect(formatDuration(65)).toBe("1h05");
  });
});
