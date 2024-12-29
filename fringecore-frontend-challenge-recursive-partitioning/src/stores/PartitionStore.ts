import { makeAutoObservable } from "mobx";
import {
  Partition,
  createInitialPartition,
  generatePastelColor,
} from "./PartitionTypes";
import { v4 as uuidv4 } from "uuid";

class PartitionStore {
  rootPartition: Partition | null = null;
  resizingPartition: { partition: Partition; initialSize: number } | null =
    null;

  constructor() {
    makeAutoObservable(this);
    this.initializeRoot();
  }

  initializeRoot() {
    this.rootPartition = createInitialPartition();
  }

  splitPartition(partition: Partition, direction: "vertical" | "horizontal") {
    if (partition.children.length === 0) {
      partition.direction = direction;
    }

    // Prevent direction change if children exist with a different direction
    if (partition.direction !== direction && partition.children.length > 0) {
      console.warn("Cannot change split direction");
      return;
    }

    // Create two new partitions
    const newPartition1: Partition = {
      id: uuidv4(),
      color: generatePastelColor(),
      children: [],
      parent: partition,
      size: 50,
      direction: null,
    };

    const newPartition2: Partition = {
      id: uuidv4(),
      color: generatePastelColor(),
      children: [],
      parent: partition,
      size: 50,
      direction: null,
    };

    partition.children = [newPartition1, newPartition2];
  }

  removePartition(partition: Partition) {
    if (!partition.parent) return;

    const parentPartition = partition.parent;
    const siblings = parentPartition.children;
    const index = siblings.findIndex((p) => p.id === partition.id);

    // Remove the partition
    if (index !== -1) {
      siblings.splice(index, 1);
    }

    // If parent is root and only one child remains, reset to that child
    if (!parentPartition.parent && siblings.length === 1) {
      const remainingChild = siblings[0];
      this.rootPartition = remainingChild;
      remainingChild.parent = null;
      remainingChild.direction = null;
      remainingChild.size = 100;
      return;
    }

    // If siblings remain, redistribute their sizes equally
    if (siblings.length > 0) {
      const equalSize = 50 / siblings.length;
      siblings.forEach((sibling) => {
        sibling.size = equalSize;
      });
    }

    // If parent has a parent, update the grandparent's children
    if (parentPartition.parent) {
      const grandParentChildren = parentPartition.parent.children;
      const parentIndex = grandParentChildren.findIndex(
        (p) => p.id === parentPartition.id
      );

      if (parentIndex !== -1) {
        if (siblings.length === 1) {
          // If only one sibling remains, replace the parent with this sibling
          const remainingSibling = siblings[0];
          remainingSibling.parent = parentPartition.parent;
          grandParentChildren[parentIndex] = remainingSibling;
        } else if (siblings.length === 0) {
          // If no siblings remain, remove the parent from grandparent's children
          grandParentChildren.splice(parentIndex, 1);
        }
      }
    }
  }

  resizePartition(partition: Partition, newSize: number) {
    if (!partition.parent) return;

    // Constrain size between 10 and 90 to prevent extremely small partitions
    const constrainedSize = Math.max(10, Math.min(90, newSize));

    const siblings = partition.parent.children;
    const otherSiblings = siblings.filter((p) => p.id !== partition.id);

    // Calculate current total size of other siblings
    const otherSiblingsCurrentTotal = otherSiblings.reduce(
      (sum, sibling) => sum + sibling.size,
      0
    );

    // Calculate how much space is left for other siblings
    const remainingSpace = 100 - constrainedSize;

    // Proportionally redistribute the remaining space among other siblings
    if (otherSiblingsCurrentTotal > 0) {
      otherSiblings.forEach((sibling) => {
        const siblingProportion = sibling.size / otherSiblingsCurrentTotal;
        sibling.size = remainingSpace * siblingProportion;
      });
    }

    // Set the size of the resized partition
    partition.size = constrainedSize;
  }

  startResize(partition: Partition) {
    this.resizingPartition = {
      partition,
      initialSize: partition.size,
    };
  }

  endResize() {
    this.resizingPartition = null;
  }
}

export default new PartitionStore();
