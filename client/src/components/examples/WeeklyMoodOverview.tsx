import { MoodProvider } from '@/contexts/MoodContext';
import WeeklyMoodOverview from '../WeeklyMoodOverview';

export default function WeeklyMoodOverviewExample() {
  return (
    <MoodProvider>
      <WeeklyMoodOverview />
    </MoodProvider>
  );
}
