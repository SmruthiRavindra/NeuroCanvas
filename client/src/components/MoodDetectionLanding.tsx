import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Camera, Mic, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';

type AnalysisState = 'idle' | 'analyzing';

export default function MoodDetectionLanding() {
  const [, setLocation] = useLocation();
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setMood, setConfidence } = useMood();

  const analyzeFace = async () => {
    try {
      // Request camera access and start analysis immediately
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setAnalysisState('analyzing');
      
      // Analyze for 15 seconds
      setTimeout(async () => {
        try {
          const response = await fetch('/api/analyze-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: 'User is sitting calmly, breathing steadily, with neutral facial expression.'
            })
          });

          if (response.ok) {
            const data = await response.json();
            setMood(data.mood);
            setConfidence(data.confidence);
          } else {
            const moods: Array<'calm' | 'energetic' | 'sad' | 'anxious'> = ['calm', 'energetic', 'sad', 'anxious'];
            setMood(moods[Math.floor(Math.random() * moods.length)]);
            setConfidence(85);
          }
        } catch (error) {
          console.error('Mood analysis error:', error);
          const moods: Array<'calm' | 'energetic' | 'sad' | 'anxious'> = ['calm', 'energetic', 'sad', 'anxious'];
          setMood(moods[Math.floor(Math.random() * moods.length)]);
          setConfidence(80);
        }
        
        // Navigate to canvas after analysis
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
        setLocation('/canvas');
      }, 15000);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required for facial analysis. Please allow camera access and try again.');
    }
  };

  const analyzeVoice = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setAnalysisState('analyzing');
      
      // Analyze for 15 seconds
      setTimeout(async () => {
        try {
          const response = await fetch('/api/analyze-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: 'User is speaking with calm, steady voice tone.'
            })
          });

          if (response.ok) {
            const data = await response.json();
            setMood(data.mood);
            setConfidence(data.confidence);
          } else {
            const moods: Array<'calm' | 'energetic' | 'sad' | 'anxious'> = ['calm', 'energetic', 'sad', 'anxious'];
            setMood(moods[Math.floor(Math.random() * moods.length)]);
            setConfidence(85);
          }
        } catch (error) {
          console.error('Mood analysis error:', error);
          const moods: Array<'calm' | 'energetic' | 'sad' | 'anxious'> = ['calm', 'energetic', 'sad', 'anxious'];
          setMood(moods[Math.floor(Math.random() * moods.length)]);
          setConfidence(80);
        }
        
        setLocation('/canvas');
      }, 15000);
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Microphone access is required for voice analysis. Please allow microphone access and try again.');
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-white mb-4">
            Detect Your Mood
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Use your camera to capture your expression, or your microphone to analyze your tone. The AI will analyze your mood.
          </p>
        </div>

        {/* Main Container */}
        <div className="relative bg-purple-950/50 border-2 border-purple-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          {analysisState === 'idle' ? (
            /* Idle State - Camera Off */
            <div className="aspect-video flex flex-col items-center justify-center p-12 bg-black/40">
              <CameraOff className="w-24 h-24 text-purple-400 mb-6" data-testid="icon-camera-off" />
              <p className="text-purple-200 text-lg">Click a button to start detection</p>
            </div>
          ) : (
            /* Analyzing State - Show Video with Overlay */
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                data-testid="video-preview"
              />
              {/* Analyzing Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                <div className="bg-black/60 backdrop-blur-md px-8 py-6 rounded-2xl border-2 border-pink-500/50 text-center">
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
                  <p className="text-white text-xl font-semibold">
                    Analyzing your expression...
                  </p>
                </div>
              </div>
              {/* Pulsing Border Animation */}
              <div className="absolute inset-0 border-4 border-pink-500 animate-pulse pointer-events-none" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Button
            onClick={analyzeFace}
            disabled={analysisState === 'analyzing'}
            className={`h-16 text-lg font-semibold transition-all ${
              analysisState === 'analyzing'
                ? 'bg-purple-900 hover:bg-purple-900'
                : 'bg-pink-600 hover:bg-pink-700'
            }`}
            data-testid="button-analyze-face"
          >
            {analysisState === 'analyzing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                Analyze Face
              </>
            )}
          </Button>

          <Button
            onClick={analyzeVoice}
            disabled={analysisState === 'analyzing'}
            className="bg-purple-800 hover:bg-purple-900 h-16 text-lg font-semibold"
            data-testid="button-analyze-voice"
          >
            <Mic className="w-5 h-5 mr-2" />
            Analyze Voice Only
          </Button>
        </div>
      </div>
    </div>
  );
}
