import { useEffect, useState } from 'react';
import type { MeetingInputFile } from '../../../features/input/MeetingInputFlow.types';

export function useFileDurations(files: MeetingInputFile[]): {
  durations: Record<string, number | null>;
  isReadingMetadata: boolean;
} {
  const [durations, setDurations] = useState<Record<string, number | null>>({});
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const readDuration = (file: MeetingInputFile) =>
      new Promise<{ id: string; duration: number | null }>((resolve) => {
        const audio = document.createElement('audio');
        const objectUrl = URL.createObjectURL(file.file);

        const finalize = (duration: number | null) => {
          URL.revokeObjectURL(objectUrl);
          resolve({ id: file.id, duration });
        };

        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          const duration = Number.isFinite(audio.duration) ? audio.duration : null;
          finalize(duration);
        };
        audio.onerror = () => finalize(null);
        audio.src = objectUrl;
      });

    const missingFiles = files.filter((file) => !(file.id in durations));
    if (missingFiles.length === 0) {
      return;
    }

    setPendingCount((current) => current + missingFiles.length);

    void Promise.all(missingFiles.map(readDuration)).then((results) => {
      if (cancelled) {
        return;
      }

      setDurations((current) => {
        const next = { ...current };
        for (const result of results) {
          next[result.id] = result.duration;
        }
        return next;
      });
      setPendingCount((current) => Math.max(0, current - results.length));
    });

    return () => {
      cancelled = true;
    };
  }, [durations, files]);

  const removedIds = Object.keys(durations).filter(
    (fileId) => !files.some((file) => file.id === fileId),
  );

  useEffect(() => {
    if (removedIds.length === 0) {
      return;
    }

    setDurations((current) => {
      const next = { ...current };
      for (const fileId of removedIds) {
        delete next[fileId];
      }
      return next;
    });
  }, [removedIds]);

  return {
    durations,
    isReadingMetadata: pendingCount > 0,
  };
}
