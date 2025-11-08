import { MoodProvider } from '@/contexts/MoodContext';
import Journal from '../Journal';

export default function JournalExample() {
  return (
    <MoodProvider>
      <Journal />
    </MoodProvider>
  );
}
