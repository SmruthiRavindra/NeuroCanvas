import { MoodProvider } from '@/contexts/MoodContext';
import MoodDetectionLanding from '../MoodDetectionLanding';

export default function MoodDetectionLandingExample() {
  return (
    <MoodProvider>
      <MoodDetectionLanding />
    </MoodProvider>
  );
}
