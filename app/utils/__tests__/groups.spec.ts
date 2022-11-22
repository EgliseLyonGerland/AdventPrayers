import { inGroup, parseGroups, resolveGroup } from "../groups";

test("parseGroups()", () => {
  expect(parseGroups("4,8,20,30")).toEqual([
    { min: 4, max: 7, label: "4-7" },
    { min: 8, max: 19, label: "8-19" },
    { min: 20, max: 29, label: "20-29" },
    { min: 30, max: Infinity, label: "30+" },
  ]);
  expect(parseGroups([6, 10, 14, 18, 25])).toEqual([
    { min: 6, max: 9, label: "6-9" },
    { min: 10, max: 13, label: "10-13" },
    { min: 14, max: 17, label: "14-17" },
    { min: 18, max: 24, label: "18-24" },
    { min: 25, max: Infinity, label: "25+" },
  ]);
});

test("resolveGroup()", () => {
  expect(resolveGroup("4-7", "4,8,20,30")).toEqual({
    min: 4,
    max: 7,
    label: "4-7",
  });
  expect(resolveGroup("50", "4,8,20,30")).toEqual({
    min: 30,
    max: Infinity,
    label: "30+",
  });
});

test("inGroup()", () => {
  expect(inGroup("4-7", { min: 4, max: 7, label: "foo" })).toEqual(true);
  expect(inGroup("4-7", { min: 10, max: 12, label: "foo" })).toEqual(false);
  expect(inGroup("4-7", { min: 3, max: 5, label: "foo" })).toEqual(true);
  expect(inGroup("4-7", { min: 6, max: 8, label: "foo" })).toEqual(false);
  expect(inGroup("4-7", { min: 6, max: 10, label: "foo" })).toEqual(false);
});
