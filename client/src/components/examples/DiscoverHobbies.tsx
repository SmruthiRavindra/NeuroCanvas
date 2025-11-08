import { MoodProvider } from '@/contexts/MoodContext';
import DiscoverHobbies from '../DiscoverHobbies';

export default function DiscoverHobbiesExample() {
  return (
    <MoodProvider>
      <DiscoverHobbies />
    </MoodProvider>
  );
}
