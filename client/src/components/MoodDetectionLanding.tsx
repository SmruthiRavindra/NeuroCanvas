import { useState } from 'react';
import { useLocation } from 'wouter';
import { Mic, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';

type AnalysisState = 'idle' | 'analyzing';

export default function MoodDetectionLanding() {
  const [, setLocation] = useLocation();
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const { setMood, setConfidence } = useMood();

  const analyzeVoice = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setAnalysisState('analyzing');
      setTranscript('');

      // Promise-based speech recognition wrapper
      const startRecognition = (): Promise<{ transcript: string; hasTranscript: boolean }> => {
        return new Promise((resolve, reject) => {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          
          if (!SpeechRecognition) {
            resolve({ transcript: '', hasTranscript: false });
            return;
          }

          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          let finalTranscript = '';
          let interimBuffer = '';

          recognition.onresult = (event: any) => {
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                // Accumulate finalized segments
                finalTranscript += transcript + ' ';
              } else {
                currentInterim += transcript;
              }
            }

            // Update interim buffer
            interimBuffer = currentInterim;

            // Display accumulated final + current interim
            const displayText = finalTranscript + interimBuffer;
            setTranscript(displayText);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            // Don't reject for non-fatal errors, just log them
            if (event.error === 'aborted' || event.error === 'network') {
              reject(new Error(`Speech recognition error: ${event.error}`));
            }
          };

          recognition.onend = () => {
            // Flush any remaining interim text to final transcript
            if (interimBuffer) {
              finalTranscript += interimBuffer;
            }
            console.log('Speech recognition ended, final transcript:', finalTranscript);
            resolve({ 
              transcript: finalTranscript.trim(), 
              hasTranscript: !!finalTranscript.trim() 
            });
          };

          recognition.start();

          // Stop recognition after 10 seconds
          setTimeout(() => {
            recognition.stop();
          }, 10000);
        });
      };

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

      // Start speech recognition (runs for 10 seconds)
      const recognitionPromise = startRecognition().catch(err => {
        console.warn('Recognition failed:', err);
        return { transcript: '', hasTranscript: false };
      });

      // Analyze for 10 seconds
      setTimeout(async () => {
        clearInterval(analyzeInterval);
        mediaRecorder.stop();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();

        // Wait for recognition to complete and get final transcript
        const { transcript: spokenText, hasTranscript } = await recognitionPromise;

        // Calculate averages
        const avgVolume = voiceFeatures.avgVolume / voiceFeatures.samples;
        const avgPitch = voiceFeatures.avgPitch / voiceFeatures.samples;
        const avgEnergy = voiceFeatures.energy / voiceFeatures.samples;

        // Build voice characteristics string
        const voiceCharacteristics = 
          `Voice characteristics: Average pitch ${avgPitch.toFixed(0)}Hz (${avgPitch > 200 ? 'high-pitched' : avgPitch < 150 ? 'low-pitched' : 'moderate-pitched'}), ` +
          `volume ${avgVolume.toFixed(0)} (${avgVolume > 100 ? 'loud' : avgVolume < 80 ? 'quiet' : 'normal'}), ` +
          `energy ${avgEnergy.toFixed(0)} (${avgEnergy > 3500 ? 'very energetic' : avgEnergy < 2000 ? 'low energy' : 'moderate'})`;

        // Combine transcript with voice characteristics for comprehensive analysis
        const analysisText = spokenText 
          ? `${spokenText}. ${voiceCharacteristics}`
          : voiceCharacteristics;

        console.log('Sending to Gemini:', analysisText);

        try {
          // Send accumulated transcribed words or voice characteristics to Gemini
          const response = await fetch('/api/analyze-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: analysisText,
              hasTranscript
            })
          });

          if (response.ok) {
            const data = await response.json();
            setMood(data.mood);
            setConfidence(data.confidence);
          } else {
            // Fallback based on voice characteristics
            let fallbackMood: 'calm' | 'energetic' | 'sad' | 'anxious' = 'calm';
            if (avgPitch > 200 && avgEnergy > 3000) {
              fallbackMood = 'energetic';
            } else if (avgPitch < 150 && avgVolume < 80) {
              fallbackMood = 'sad';
            } else if (avgEnergy > 3500 && avgPitch > 180) {
              fallbackMood = 'anxious';
            }
            setMood(fallbackMood);
            setConfidence(70);
          }
        } catch (error) {
          console.error('Mood analysis error:', error);
          // Fallback
          setMood('calm');
          setConfidence(70);
        }
        
        setLocation('/canvas');
      }, 10000);
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Microphone access is required for voice analysis. Please allow microphone access and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full">
          {/* Title Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative p-5 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 shadow-2xl">
                <Sparkles className="w-14 h-14 text-white animate-pulse" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
              Detect Your Mood
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto leading-relaxed font-light">
              Use your voice to analyze your emotional state. Speak naturally and let our AI understand how you're feeling.
            </p>
          </div>

        {/* Main Container - Glassmorphism */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-16 transition-all duration-500">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
          
          {analysisState === 'idle' ? (
            /* Idle State */
            <div className="relative flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative group">
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-2xl animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-pink-400/30 animate-ping delay-300" />
                
                {/* Main icon */}
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  <Mic className="w-20 h-20 text-white drop-shadow-lg" data-testid="icon-mic" />
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-white text-2xl font-semibold">Ready to listen</p>
                <p className="text-purple-200 text-lg font-light">Click the button below to start voice analysis</p>
              </div>
            </div>
          ) : (
            /* Analyzing State */
            <div className="relative flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative w-40 h-40">
                {/* Pulsing background glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 opacity-50 animate-pulse blur-2xl" />
                
                {/* Multiple animated rings */}
                <div className="absolute inset-0 rounded-full border-4 border-pink-400/50 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-purple-400/50 animate-ping delay-150" />
                <div className="absolute inset-4 rounded-full border-4 border-indigo-400/50 animate-ping delay-300" />
                
                {/* Center icon container */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-900 to-indigo-900 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                  <Mic className="w-16 h-16 text-pink-400 animate-pulse" data-testid="icon-analyzing" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Loader2 className="w-10 h-10 text-pink-400 animate-spin mx-auto" />
                <p className="text-white text-3xl font-bold">
                  Listening to your words...
                </p>
                {transcript ? (
                  <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl mx-auto">
                    <p className="text-sm text-purple-300 mb-2 font-semibold">What you said:</p>
                    <p className="text-white text-lg font-light leading-relaxed" data-testid="text-transcript">
                      "{transcript}"
                    </p>
                  </div>
                ) : (
                  <p className="text-purple-200 text-lg font-light">
                    Speak naturally - we're analyzing your words and tone
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={analyzeVoice}
            disabled={analysisState === 'analyzing'}
            size="lg"
            className={`relative h-18 px-16 text-xl font-semibold transition-all duration-300 rounded-2xl shadow-2xl overflow-hidden group ${
              analysisState === 'analyzing'
                ? 'bg-purple-900/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 hover:scale-105 active:scale-95 hover:shadow-pink-500/50'
            }`}
            data-testid="button-analyze-voice"
          >
            {/* Button glow effect */}
            {analysisState === 'idle' && (
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            )}
            
            <span className="relative flex items-center gap-3">
              {analysisState === 'analyzing' ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 group-hover:animate-pulse" />
                  Start Voice Analysis
                </>
              )}
            </span>
          </Button>
        </div>

        {/* Info Text */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-purple-200 text-base font-light">
            You'll be prompted to allow microphone access.
          </p>
          <p className="text-purple-300 text-sm font-light">
            Speak naturally for 10 seconds - our AI analyzes the words you say and your voice tone
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
