import { describe, expect, it } from "vitest";
import { getProposals, scoreCandidate, SchedulableTask, Constraints } from "../../src/lib/scheduling";

const constraints: Constraints = {
  sleepStart: "21:00",
  sleepEnd: "07:00",
  lunchStart: "12:00",
  lunchEnd: "13:30",
  dndStart: "20:00",
  dndEnd: "21:00",
};

function task(overrides: Partial<SchedulableTask> = {}): SchedulableTask {
  return {
    id: "t1",
    weekday: 0,
    time: "17:00",
    priority: "medium",
    deadlineWeekday: null,
    memberIds: ["m1"],
    ...overrides,
  };
}

describe("scoreCandidate", () => {
  it("excludes slots inside lunch, do-not-disturb, or sleep windows", () => {
    const t = task();
    expect(scoreCandidate(0, "12:30", t, [], constraints)).toBeNull(); // lunch
    expect(scoreCandidate(0, "20:30", t, [], constraints)).toBeNull(); // dnd
    expect(scoreCandidate(0, "22:00", t, [], constraints)).toBeNull(); // sleep (wraps midnight)
  });

  it("excludes candidates strictly after the task's deadline weekday, but allows the deadline day itself", () => {
    const t = task({ deadlineWeekday: 2 });
    expect(scoreCandidate(3, "09:00", t, [], constraints)).toBeNull();
    expect(scoreCandidate(2, "09:00", t, [], constraints)).not.toBeNull();
    expect(scoreCandidate(1, "09:00", t, [], constraints)).not.toBeNull();
  });

  it("excludes a slot already taken by an overlapping member", () => {
    const t = task({ id: "t1", memberIds: ["m1"] });
    const other = task({ id: "t2", weekday: 0, time: "09:00", memberIds: ["m1", "m2"] });
    expect(scoreCandidate(0, "09:00", t, [other], constraints)).toBeNull();
  });

  it("allows the same slot if no member overlaps", () => {
    const t = task({ id: "t1", memberIds: ["m1"] });
    const other = task({ id: "t2", weekday: 0, time: "09:00", memberIds: ["m2"] });
    expect(scoreCandidate(0, "09:00", t, [other], constraints)).not.toBeNull();
  });

  it("scores a high-priority task higher in the morning than in the evening", () => {
    const t = task({ priority: "high" });
    const morning = scoreCandidate(0, "09:00", t, [], constraints)!;
    const evening = scoreCandidate(0, "18:00", t, [], constraints)!;
    expect(morning.score).toBeGreaterThan(evening.score);
  });

  it("scores a low-priority task higher in the evening than in the morning", () => {
    const t = task({ priority: "low" });
    const morning = scoreCandidate(0, "09:00", t, [], constraints)!;
    const evening = scoreCandidate(0, "18:00", t, [], constraints)!;
    expect(evening.score).toBeGreaterThan(morning.score);
  });
});

describe("getProposals", () => {
  it("returns at most `limit` candidates, at most one per weekday, sorted best-first", () => {
    const t = task({ priority: "high" });
    const proposals = getProposals(t, [], constraints, 3);
    expect(proposals.length).toBeLessThanOrEqual(3);
    const days = proposals.map((p) => p.weekday);
    expect(new Set(days).size).toBe(days.length);
    for (let i = 1; i < proposals.length; i++) {
      expect(proposals[i - 1].score).toBeGreaterThanOrEqual(proposals[i].score);
    }
  });

  it("returns nothing once the deadline has passed for every remaining day", () => {
    const t = task({ deadlineWeekday: 0 });
    const proposals = getProposals(t, [], constraints, 3);
    // Only weekday 0 itself is eligible (weekday <= deadlineWeekday), so exactly one candidate.
    expect(proposals.every((p) => p.weekday === 0)).toBe(true);
  });
});
