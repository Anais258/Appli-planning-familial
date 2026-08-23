import { daysUntilBirthday, nextBirthdayOccurrence, reminderMoment, toExpoWeekday } from "../notifications";

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

describe("nextBirthdayOccurrence / daysUntilBirthday", () => {
  const from = new Date(2026, 2, 10); // 10 mars 2026

  it("uses this year's occurrence when the birthday hasn't happened yet", () => {
    const next = nextBirthdayOccurrence("2016-04-12", from);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(3);
    expect(next.getDate()).toBe(12);
    expect(daysUntilBirthday("2016-04-12", from)).toBe(33);
  });

  it("rolls over to next year when this year's date has passed", () => {
    const next = nextBirthdayOccurrence("2016-01-05", from);
    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(0);
    expect(next.getDate()).toBe(5);
  });

  it("returns 0 for a birthday that is today", () => {
    expect(daysUntilBirthday("2016-03-10", from)).toBe(0);
  });
});
