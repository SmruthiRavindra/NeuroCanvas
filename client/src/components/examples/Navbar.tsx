import { MoodProvider } from '@/contexts/MoodContext';
import Navbar from '../Navbar';

export default function NavbarExample() {
  return (
    <MoodProvider>
      <Navbar />
    </MoodProvider>
  );
}
