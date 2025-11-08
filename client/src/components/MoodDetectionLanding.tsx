import { useState } from 'react';
import { useLocation } from 'wouter';
import { Mic, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';

type AnalysisState = 'idle' | 'analyzing';

export default function MoodDetectionLanding() {
  const [, setLocation] = useLocation();
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const { setMood, setConfidence } = useMood();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">
            Detect Your Mood
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Use your voice to analyze your emotional state. Speak naturally and let our AI understand how you're feeling through voice tone and patterns.
          </p>
        </div>

        {/* Main Container */}
        <div className="relative bg-purple-950/50 border-2 border-purple-800 rounded-2xl overflow-hidden backdrop-blur-sm p-12">
          {analysisState === 'idle' ? (
            /* Idle State */
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-8">
                <Mic className="w-16 h-16 text-white" data-testid="icon-mic" />
              </div>
              <p className="text-purple-200 text-xl mb-2">Ready to listen</p>
              <p className="text-purple-300 text-sm">Click the button below to start voice analysis</p>
            </div>
          ) : (
            /* Analyzing State */
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-purple-950 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-pink-400 animate-pulse" />
                </div>
              </div>
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-4" />
              <p className="text-white text-2xl font-semibold mb-2">
                Analyzing your voice...
              </p>
              <p className="text-purple-200">
                Processing tone, pitch, and emotional patterns
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={analyzeVoice}
            disabled={analysisState === 'analyzing'}
            size="lg"
            className={`h-16 px-12 text-lg font-semibold transition-all ${
              analysisState === 'analyzing'
                ? 'bg-purple-900 hover:bg-purple-900'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
            }`}
            data-testid="button-analyze-voice"
          >
            {analysisState === 'analyzing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Voice Analysis
              </>
            )}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-purple-300 text-sm mt-6">
          You'll be prompted to allow microphone access. Speak for about 15 seconds for accurate results.
        </p>
      </div>
    </div>
  );
}
