import type { DragEvent } from 'react';

/** Drag start payload for any ordered row or section. */
export function rowDragStart(index: number): {
  onDragStart: (event: DragEvent) => void;
} {
  return {
    onDragStart: (event) => {
      event.dataTransfer.effectAllowed = 'move';
      try {
        event.dataTransfer.setData('text/plain', String(index));
      } catch {
        // Some browsers only need the drag image.
      }
    },
  };
}

/** Drop target props for a section at `index` in the current order. */
export function sectionDropProps(
  index: number,
  onMove: (from: number, to: number) => void,
): {
  onDragOver: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
} {
  return {
    onDragOver: (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    onDrop: (event) => {
      event.preventDefault();
      let from: number | null = null;
      try {
        const raw = event.dataTransfer.getData('text/plain');
        if (raw !== '') from = Number(raw);
      } catch {
        // Ignore
      }
      if (from === null || Number.isNaN(from) || from === index) return;
      onMove(from, index);
    },
  };
}
