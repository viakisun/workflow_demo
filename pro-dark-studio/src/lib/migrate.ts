export function migrateWorkflow(input: any) {
  if (
    input?.graph?.lanes?.[0]?.deviceType &&
    !input.graph.lanes[0].deviceFilter
  ) {
    console.log("Migrating legacy workflow: renaming deviceType to deviceFilter");
    input.graph.lanes.forEach((l: any) => {
      l.deviceFilter = { type: l.deviceType };
      delete l.deviceType;
    });
    input.catalogVersion = input.catalogVersion ?? "2.3.0";
  }
  return input;
}

export const migrateRules = (x: any) => {
  // Add rule migration logic here if needed in the future
  return x;
};

export const migrateRegistry = (x: any) => {
  // Add registry migration logic here if needed in the future
  return x;
};
