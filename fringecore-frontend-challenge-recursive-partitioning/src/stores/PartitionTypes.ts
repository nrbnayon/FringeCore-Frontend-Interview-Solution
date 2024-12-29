// src/stores/PartitionTypes.ts
import { v4 as uuidv4 } from "uuid";

export type PartitionDirection = "vertical" | "horizontal";

export interface Partition {
  id: string;
  color: string;
  size: number;
  direction: PartitionDirection | null;
  children: Partition[];
  parent: Partition | null;
}

export function createInitialPartition(): Partition {
  return {
    id: uuidv4(),
    color: generatePastelColor(),
    size: 100,
    direction: null,
    children: [],
    parent: null,
  };
}

export function generatePastelColor(): string {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h}, 70%, 80%)`;
}
