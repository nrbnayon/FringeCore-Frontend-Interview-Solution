import { useState, useRef, useMemo } from "react";
import { observer } from "mobx-react-lite";
import PartitionStore from "../stores/PartitionStore";
import { Partition as PartitionType } from "../stores/PartitionTypes";

interface PartitionProps {
  partition: PartitionType;
}

const SNAP_POINTS = [0.25, 0.5, 0.75];
const SNAP_THRESHOLD = 0.05;

const Partition: React.FC<PartitionProps> = observer(({ partition }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizePercentage, setResizePercentage] = useState(0);
  const partitionRef = useRef<HTMLDivElement>(null);

  const handleSplit = (direction: "vertical" | "horizontal") => {
    PartitionStore.splitPartition(partition, direction);
  };

  const handleRemove = () => {
    PartitionStore.removePartition(partition);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!partition.parent) return;

    e.stopPropagation();
    setIsResizing(true);
    PartitionStore.startResize(partition);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!partitionRef.current) return;

      const rect = partitionRef.current.getBoundingClientRect();
      let newSizePercentage: number;

      if (partition.parent?.direction === "vertical") {
        newSizePercentage =
          ((moveEvent.clientX - rect.left) / rect.width) * 100;
      } else {
        newSizePercentage =
          ((moveEvent.clientY - rect.top) / rect.height) * 100;
      }

      const snappedSize = snapSize(newSizePercentage);
      setResizePercentage(snappedSize);
      PartitionStore.resizePartition(partition, snappedSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      PartitionStore.endResize();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const snapSize = (size: number): number => {
    const constrainedSize = Math.max(10, Math.min(90, size));

    for (const snapPoint of SNAP_POINTS) {
      const snapPercentage = snapPoint * 100;
      if (Math.abs(constrainedSize - snapPercentage) < SNAP_THRESHOLD * 100) {
        return snapPercentage;
      }
    }

    return constrainedSize;
  };

  const renderChildren = () => {
    if (!partition.children || partition.children.length === 0) {
      return null;
    }

    const isVertical = partition.direction === "vertical";
    const flexDirection = isVertical ? "flex-row" : "flex-col";

    return (
      <div className={`flex ${flexDirection} w-full h-full`}>
        {partition.children.map((child) => (
          <Partition key={child.id} partition={child} />
        ))}
      </div>
    );
  };

  const isResizable = !!partition.parent;
  const isRoot = !partition.parent;

  const style = {
    backgroundColor: partition.color,
    width:
      partition.parent?.direction === "vertical"
        ? `${partition.size}%`
        : "100%",
    height:
      partition.parent?.direction === "horizontal"
        ? `${partition.size}%`
        : "100%",
    border: "1px solid #000",
    cursor: isResizable
      ? partition?.parent?.direction === "vertical"
        ? "col-resize"
        : "row-resize"
      : "default",
  };

  const shouldShowResizeHandle =
    (isResizable && partition.children.length === 0) ||
    (isResizable && partition.children.length > 0);

  const resizeHandleStyle = useMemo(
    () =>
      partition.parent?.direction === "vertical"
        ? `absolute right-0 top-0 bottom-0 w-2 ${
            isResizing
              ? "bg-red-500/70"
              : "bg-transparent hover:bg-red-500/50 cursor-col-resize"
          }`
        : `absolute bottom-0 left-0 right-0 h-2 ${
            isResizing
              ? "bg-red-500/70"
              : "bg-transparent hover:bg-red-500/50 cursor-row-resize"
          }`,
    [isResizing, partition.parent?.direction]
  );

  const shouldShowButtons =
    (isRoot && partition.children.length === 0) ||
    (!isRoot && partition.children.length === 0);

  return (
    <div
      ref={partitionRef}
      className={`relative flex items-center justify-center ${
        isResizing ? "select-none" : ""
      } transition-all duration-300`}
      style={style}
    >
      {shouldShowResizeHandle && (
        <div
          className={`absolute z-20 ${resizeHandleStyle}`}
          onMouseDown={handleMouseDown}
        >
          {isResizing && (
            <span
              className='absolute text-xs text-white bg-black rounded-md p-2'
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {resizePercentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {shouldShowButtons && (
        <div className='absolute inset-0 flex items-center justify-center z-10'>
          <div className='flex space-x-2'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSplit("vertical");
              }}
              className='bg-white text-black p-2 rounded shadow-md hover:bg-gray-100'
            >
              V
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSplit("horizontal");
              }}
              className='bg-white text-black p-2 rounded shadow-md hover:bg-gray-100'
            >
              H
            </button>
            {!isRoot && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className='bg-red-500 text-white p-2 rounded shadow-md hover:bg-red-600'
              >
                -
              </button>
            )}
          </div>
        </div>
      )}

      {renderChildren()}
    </div>
  );
});

export default Partition;
