import type { CatalogFilters } from "./queries";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: CatalogFilters) => [...eventKeys.lists(), filters] as const,
};
