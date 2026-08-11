import { describe, expect, it } from "vitest";
import { dateForWeekday, jsDayToWeekday, mondayOfWeek, weekdayOfDate, weekdayToJsDay } from "../../src/lib/dates";

describe("jsDayToWeekday / weekdayToJsDay", () => {
  it("maps JS Sun-first days onto the Lun-first 0..6 convention", () => {
    // JS: 0=Sun 1=Mon 2=Tue ... 6=Sat  ->  ours: 0=Lun ... 6=Dim
    expect(jsDayToWeekday(1)).toBe(0); // Monday
    expect(jsDayToWeekday(0)).toBe(6); // Sunday
    expect(jsDayToWeekday(3)).toBe(2); // Wednesday
  });

  it("round-trips through both directions", () => {
    for (let w = 0; w <= 6; w++) {
      expect(jsDayToWeekday(weekdayToJsDay(w as 0 | 1 | 2 | 3 | 4 | 5 | 6))).toBe(w);
    }
  });
});

describe("mondayOfWeek", () => {
  it("returns the Monday of the same week at midnight", () => {
    const wednesday = new Date("2026-08-12T15:30:00"); // a Wednesday
    const monday = mondayOfWeek(wednesday);
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(10);
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
  });

  it("treats a Sunday as the end of the week it belongs to", () => {
    const sunday = new Date("2026-08-16T09:00:00");
    const monday = mondayOfWeek(sunday);
    expect(monday.getDate()).toBe(10);
  });
});

describe("dateForWeekday / weekdayOfDate", () => {
  it("returns a date in the same week as the reference, for the given weekday", () => {
    const reference = new Date("2026-08-12T00:00:00"); // Wednesday of that week
    const friday = dateForWeekday(4, reference); // 4 = Ven
    expect(weekdayOfDate(friday)).toBe(4);
    expect(friday.getDate()).toBe(14);
  });
});
