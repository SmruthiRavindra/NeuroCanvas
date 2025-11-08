import { MoodProvider } from '@/contexts/MoodContext';
import Community from '../Community';

export default function CommunityExample() {
  return (
    <MoodProvider>
      <Community />
    </MoodProvider>
  );
}
