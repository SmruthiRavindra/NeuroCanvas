import { MoodProvider } from '@/contexts/MoodContext';
import CreativeCanvas from '../CreativeCanvas';

export default function CreativeCanvasExample() {
  return (
    <MoodProvider>
      <CreativeCanvas />
    </MoodProvider>
  );
}
