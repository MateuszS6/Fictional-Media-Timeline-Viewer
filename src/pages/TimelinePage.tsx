import TimelineGrid from '../components/timeline/TimelineGrid';
import TimelineGuide from '../components/timeline/TimelineGuide';
import type { Character } from '../types/character';

interface TimelinePageProps {
  universeId: number;
  focusedCharacterId: number | null;
  onOpenOrigin: (character: Character) => void;
}

export default function TimelinePage(props: TimelinePageProps) {
  return (
    <>
      <TimelineGuide />
      <TimelineGrid {...props} />
    </>
  );
}