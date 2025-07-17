import { useQuery } from "@tanstack/react-query";
import type { InventoryItem } from "@/lib/types";

export function useInventory() {
  return useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });
}

export function useInventoryHealth() {
  return useQuery({
    queryKey: ["/api/inventory/health"],
  });
}
