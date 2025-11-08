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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setAnalysisState('analyzing');

      // Create audio context for voice analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 2048;
      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Record audio for analysis
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.start();

      // Analyze voice characteristics in real-time
      const voiceFeatures = {
        avgPitch: 0,
        avgVolume: 0,
        energy: 0,
        pitchVariation: 0,
        samples: 0
      };

      const analyzeInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume (amplitude)
        const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        
        // Calculate dominant frequency (pitch approximation)
        let maxValue = 0;
        let maxIndex = 0;
        for (let i = 0; i < bufferLength; i++) {
          if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
          }
        }
        const pitch = maxIndex * audioContext.sampleRate / analyser.fftSize;
        
        // Calculate energy (sum of squares)
        const energy = dataArray.reduce((sum, value) => sum + value * value, 0) / bufferLength;
        
        voiceFeatures.avgVolume += volume;
        voiceFeatures.avgPitch += pitch;
        voiceFeatures.energy += energy;
        voiceFeatures.samples++;
      }, 100);

      // Analyze for 10 seconds
      setTimeout(async () => {
        clearInterval(analyzeInterval);
        mediaRecorder.stop();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();

        // Calculate averages
        const avgVolume = voiceFeatures.avgVolume / voiceFeatures.samples;
        const avgPitch = voiceFeatures.avgPitch / voiceFeatures.samples;
        const avgEnergy = voiceFeatures.energy / voiceFeatures.samples;

        // Determine mood based on voice characteristics
        let detectedMood: 'calm' | 'energetic' | 'sad' | 'anxious';
        let confidence = 75;

        // High pitch + high energy = energetic/excited
        if (avgPitch > 200 && avgEnergy > 3000) {
          detectedMood = 'energetic';
          confidence = 85;
        }
        // Low pitch + low volume = sad/dull
        else if (avgPitch < 150 && avgVolume < 80) {
          detectedMood = 'sad';
          confidence = 80;
        }
        // High energy + medium-high pitch = anxious
        else if (avgEnergy > 3500 && avgPitch > 180) {
          detectedMood = 'anxious';
          confidence = 82;
        }
        // Default to calm for steady, moderate characteristics
        else {
          detectedMood = 'calm';
          confidence = 78;
        }

        // Create analysis description for Gemini
        const voiceDescription = `Voice analysis: Average pitch ${avgPitch.toFixed(0)}Hz (${avgPitch > 200 ? 'high-pitched' : avgPitch < 150 ? 'low-pitched' : 'moderate'}), ` +
          `volume ${avgVolume.toFixed(0)} (${avgVolume > 100 ? 'loud' : avgVolume < 80 ? 'quiet' : 'normal'}), ` +
          `energy ${avgEnergy.toFixed(0)} (${avgEnergy > 3500 ? 'very energetic' : avgEnergy < 2000 ? 'low energy' : 'moderate'})`;

        try {
          // Send to Gemini for additional analysis
          const response = await fetch('/api/analyze-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: voiceDescription
            })
          });

          if (response.ok) {
            const data = await response.json();
            // Use Gemini's analysis if confident, otherwise use our detection
            if (data.confidence > confidence) {
              setMood(data.mood);
              setConfidence(data.confidence);
            } else {
              setMood(detectedMood);
              setConfidence(confidence);
            }
          } else {
            setMood(detectedMood);
            setConfidence(confidence);
          }
        } catch (error) {
          console.error('Mood analysis error:', error);
          setMood(detectedMood);
          setConfidence(confidence);
        }
        
        setLocation('/canvas');
      }, 10000);
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
          You'll be prompted to allow microphone access. Speak naturally for 10 seconds - our AI will analyze your voice pitch, tone, and energy to detect your mood.
        </p>
      </div>
    </div>
  );
}
