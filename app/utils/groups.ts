type Group = {
  min: number;
  max: number;
  label: string;
};

export function parseGroups(groups: string | number[]): Group[] {
  const splitted =
    typeof groups === "string" ? groups.split(",").map(Number) : groups;

  return splitted.map((item, index) => {
    const min = item;
    const max = splitted[index + 1] - 1 || Infinity;
    const label = max === Infinity ? `${min}+` : `${min}-${max}`;

    return { min, max, label };
  });
}

export function resolveGroup(age: string, groups: string | number[]): Group {
  const parsedGroups = parseGroups(groups);

  for (const group of parsedGroups) {
    if (inGroup(age, group)) {
      return group;
    }
  }

  return parsedGroups[parsedGroups.length - 1];
}

export function inGroup(age: string | number, group: Group): boolean {
  const parsedAge = typeof age === "string" ? parseInt(age) : age;

  return parsedAge >= group.min && parsedAge <= group.max;
}
