import { useMemo, useRef } from 'react';
import { File } from '../../types';

const headingOrder: { [key: string]: number } = {
  title: 1,
  artist: 2,
  album: 3,
  albumArtist: 4,
  genre: 5,
  trackNumber: 6,
  discNumber: 7,
};

function useTableHeadings(files: File[]): string[] {
  const ref = useRef<string[]>([]);

  return useMemo(() => {
    // Find all used tags / headings
    const headings = files.reduce<string[]>((acc, file) => {
      Object.keys(file.tags).forEach((tag) => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
      return acc;
    }, []);

    // If the heading count did not change, headings did not change, wich means we can return the old headings and
    // react will not rerender the hole table. A different array with same values will cause rerender of the table
    if (ref.current.length === headings.length) {
      return ref.current;
    }

    headings.sort((a, b) => {
      const aValue = headingOrder[a] || 99;
      const bValue = headingOrder[b] || 99;

      if (aValue === bValue) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      }

      // Smaller is better
      if (aValue < bValue) {
        return -1;
      }
      return 1;
    });

    ref.current = headings;

    return headings;
  }, [files]);
}

export default useTableHeadings;
