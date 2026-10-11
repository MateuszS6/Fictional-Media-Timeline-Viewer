import TimelineGrid from '../components/timeline/TimelineGrid';
import type { Character } from '../types/character';

interface TimelinePageProps {
  universeId: number;
  focusedCharacterId: number | null;
  onOpenOrigin: (character: Character) => void;
}

export default function TimelinePage(props: TimelinePageProps) {
  return <TimelineGrid {...props} />;
}