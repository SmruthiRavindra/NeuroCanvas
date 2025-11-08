import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Mic, Loader2, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import * as faceapi from '@vladmandic/face-api';

type AnalysisState = 'idle' | 'analyzing';

export default function MoodDetectionLanding() {
  const [, setLocation] = useLocation();
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const { setMood, setConfidence } = useMood();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load face-api models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log('Face-api models loaded successfully');
      } catch (error) {
        console.warn('Failed to load face-api models:', error);
        setModelsLoaded(false);
      }
    };
    loadModels();
  }, []);

  const analyzeVoiceAndVideo = async () => {
    try {
      setAnalysisState('analyzing');
      setTranscript('');

      // Request microphone and camera access
      const wantsVideo = videoEnabled && modelsLoaded;
      const constraints = wantsVideo
        ? { audio: true, video: { width: 720, height: 480, facingMode: 'user' } }
        : { audio: true };
      
      let stream: MediaStream;
      let actuallyHasVideo = false;
      
      try {
        console.log('Requesting media with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoTracks = stream.getVideoTracks();
        actuallyHasVideo = wantsVideo && videoTracks.length > 0;
        console.log('✓ Media stream obtained!');
        console.log('  - Video tracks:', videoTracks.length, videoTracks.map(t => `${t.label} (enabled: ${t.enabled})`));
        console.log('  - Audio tracks:', stream.getAudioTracks().length);
        console.log('  - actuallyHasVideo:', actuallyHasVideo);
      } catch (err) {
        console.error('✗ Camera access denied:', err);
        // If camera failed but we wanted it, fall back to audio only
        if (wantsVideo) {
          console.log('Falling back to voice-only mode');
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          actuallyHasVideo = false;
        } else {
          throw err;
        }
      }

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

          // Stop recognition after 18 seconds
          setTimeout(() => {
            recognition.stop();
          }, 18000);
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

      // Setup video analysis if camera is available
      const videoEmotions = {
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0, // maps to anxious
        disgusted: 0,
        surprised: 0,
        neutral: 0,
        samples: 0
      };

      let faceAnalysisInterval: ReturnType<typeof setInterval> | null = null;

      if (actuallyHasVideo) {
        console.log('📹 Setting up video stream and facial analysis');
        
        // Wait for React to render the video element
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready with proper loading
          try {
            await videoRef.current.play();
            // Wait a bit more for the video to stabilize
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✓ Video playing and ready for analysis');
          } catch (playError) {
            console.warn('✗ Video play failed:', playError);
          }

          // Analyze facial expressions every 500ms with more lenient detection
          const detectionOptions = new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416, // Higher resolution for better detection
            scoreThreshold: 0.3 // More lenient threshold
          });

          faceAnalysisInterval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const detections = await faceapi
                  .detectSingleFace(videoRef.current, detectionOptions)
                  .withFaceExpressions();

                if (detections && detections.expressions) {
                  const expressions = detections.expressions;
                  videoEmotions.happy += expressions.happy || 0;
                  videoEmotions.sad += expressions.sad || 0;
                  videoEmotions.angry += expressions.angry || 0;
                  videoEmotions.fearful += expressions.fearful || 0;
                  videoEmotions.disgusted += expressions.disgusted || 0;
                  videoEmotions.surprised += expressions.surprised || 0;
                  videoEmotions.neutral += expressions.neutral || 0;
                  videoEmotions.samples++;
                  if (videoEmotions.samples % 5 === 0) {
                    const topEmotion = Math.max(expressions.happy, expressions.sad, expressions.angry, expressions.fearful, expressions.disgusted, expressions.surprised, expressions.neutral);
                    const emotionName = topEmotion === expressions.happy ? 'happy' : 
                                        topEmotion === expressions.sad ? 'sad' :
                                        topEmotion === expressions.angry ? 'angry' :
                                        topEmotion === expressions.fearful ? 'fearful' :
                                        topEmotion === expressions.disgusted ? 'disgusted' :
                                        topEmotion === expressions.surprised ? 'surprised' : 'neutral';
                    console.log(`✓ Face sample #${videoEmotions.samples} - Top emotion: ${emotionName}`);
                  }
                }
              } catch (error) {
                // Silently continue on errors - don't spam console
              }
            }
          }, 500);
          
          console.log('🎯 Facial expression detection active - make sure your face is visible!');
        } else {
          console.warn('✗ Video ref not available after waiting');
        }
      } else {
        console.log('ℹ️ Video analysis skipped - using voice-only mode');
      }

      // Start speech recognition (runs for 18 seconds)
      const recognitionPromise = startRecognition().catch(err => {
        console.warn('Recognition failed:', err);
        return { transcript: '', hasTranscript: false };
      });

      // Analyze for 18 seconds
      setTimeout(async () => {
        clearInterval(analyzeInterval);
        if (faceAnalysisInterval) clearInterval(faceAnalysisInterval);
        mediaRecorder.stop();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();

        // Wait for recognition to complete and get final transcript
        const { transcript: spokenText, hasTranscript } = await recognitionPromise;

        // Calculate voice feature averages
        const avgVolume = voiceFeatures.avgVolume / voiceFeatures.samples;
        const avgPitch = voiceFeatures.avgPitch / voiceFeatures.samples;
        const avgEnergy = voiceFeatures.energy / voiceFeatures.samples;
        const voiceConfidence = hasTranscript ? 0.85 : 0.6;

        // Calculate video emotion averages
        const avgVideoEmotions = videoEmotions.samples > 0 ? {
          happy: videoEmotions.happy / videoEmotions.samples,
          sad: videoEmotions.sad / videoEmotions.samples,
          angry: videoEmotions.angry / videoEmotions.samples,
          fearful: videoEmotions.fearful / videoEmotions.samples,
          disgusted: videoEmotions.disgusted / videoEmotions.samples,
          surprised: videoEmotions.surprised / videoEmotions.samples,
          neutral: videoEmotions.neutral / videoEmotions.samples,
        } : null;
        
        // Adjust confidence based on sample count
        const videoConfidence = videoEmotions.samples >= 20 ? 0.75 : 
                                videoEmotions.samples >= 10 ? 0.60 : 
                                videoEmotions.samples >= 5 ? 0.45 : 0.30;

        // Build voice characteristics string
        const voiceCharacteristics = 
          `Voice characteristics: Average pitch ${avgPitch.toFixed(0)}Hz (${avgPitch > 200 ? 'high-pitched' : avgPitch < 150 ? 'low-pitched' : 'moderate-pitched'}), ` +
          `volume ${avgVolume.toFixed(0)} (${avgVolume > 100 ? 'loud' : avgVolume < 80 ? 'quiet' : 'normal'}), ` +
          `energy ${avgEnergy.toFixed(0)} (${avgEnergy > 3500 ? 'very energetic' : avgEnergy < 2000 ? 'low energy' : 'moderate'})`;

        console.log('📊 Analysis Summary:');
        console.log('  - Face samples collected:', videoEmotions.samples);
        console.log('  - Video emotions:', avgVideoEmotions);
        console.log('  - Voice features:', { avgPitch, avgVolume, avgEnergy });
        console.log('  - Transcript:', spokenText || '(none)');

        try {
          // Send both voice and video features for multimodal analysis
          const response = await fetch('/api/analyze-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcript: spokenText,
              voiceFeatures: {
                pitch: avgPitch,
                volume: avgVolume,
                energy: avgEnergy,
                characteristics: voiceCharacteristics
              },
              voiceConfidence,
              videoEmotions: avgVideoEmotions,
              videoConfidence: avgVideoEmotions ? videoConfidence : 0,
              hasVideo: !!avgVideoEmotions
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background relative overflow-hidden animate-fade-in">
      {/* Subtle background elements - calm and minimal */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full mix-blend-normal filter blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full mix-blend-normal filter blur-3xl animate-float delay-500" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 py-20">
        <div className="max-w-5xl w-full">
          {/* Title Section - Calm and Centered */}
          <div className="text-center mb-20 space-y-6 animate-slide-up">
            <h1 className="text-6xl md:text-7xl font-heading font-bold text-foreground mb-6 tracking-tight">
              NeuroCanvas
            </h1>
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mb-4 tracking-tight">
              Detect Your Mood
            </h2>
            <p className="text-lg md:text-xl font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Use your voice to analyze your emotional state. Speak naturally and let our AI understand how you're feeling.
            </p>
          </div>

        {/* Main Container - Soft Glassmorphism */}
        <div className="relative glass shadow-2xl rounded-3xl overflow-hidden p-20 transition-all duration-500 mood-transition animate-scale-blur delay-200">
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          {analysisState === 'idle' ? (
            <div className="relative flex flex-col items-center justify-center text-center space-y-10">
              <div className="relative group">
                {/* Gentle glow */}
                <div className="absolute inset-0 rounded-full bg-primary/20 opacity-40 blur-2xl pulse-gentle" />
                
                {/* Main icon container */}
                <div className="relative w-32 h-32 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-xl group-hover:scale-105 transition-all duration-400 mood-transition">
                  <Mic className="w-16 h-16 text-primary" data-testid="icon-mic" />
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-foreground text-2xl font-heading font-semibold">Ready to listen</p>
                <p className="text-muted-foreground text-lg font-body leading-relaxed">Click the button below to start voice analysis</p>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center text-center space-y-10">
              <div className="relative w-32 h-32">
                {/* Soft pulsing glow */}
                <div className="absolute inset-0 rounded-full bg-primary/30 opacity-50 pulse-gentle blur-2xl" />
                
                {/* Center icon container */}
                <div className="absolute inset-0 rounded-full glass border border-primary/40 flex items-center justify-center shadow-xl">
                  <Mic className="w-16 h-16 text-primary pulse-gentle" data-testid="icon-analyzing" />
                </div>
              </div>
              
              <div className="space-y-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                <p className="text-foreground text-3xl font-heading font-bold">
                  Listening to your words...
                </p>
                {transcript ? (
                  <div className="mt-8 p-8 glass rounded-2xl border border-primary/20 max-w-2xl mx-auto animate-fade-in">
                    <p className="text-sm font-body text-muted-foreground mb-3 font-semibold">What you said:</p>
                    <p className="text-foreground text-lg font-body leading-relaxed" data-testid="text-transcript">
                      "{transcript}"
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-lg font-body leading-relaxed">
                    Speak naturally - we're analyzing your words and tone
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Video Preview (shown during analysis when camera is active) */}
        {analysisState === 'analyzing' && (
          <div className="mt-12 flex justify-center animate-fade-in">
            <div className="relative glass rounded-3xl p-6 border border-primary/20 shadow-lg">
              <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-white font-body font-medium flex items-center gap-2 z-10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Processing Locally
              </div>
              <video
                ref={videoRef}
                className="rounded-2xl w-80 h-60 object-cover"
                muted
                playsInline
                autoPlay
                data-testid="video-preview"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <Button
            onClick={analyzeVoiceAndVideo}
            disabled={analysisState === 'analyzing'}
            size="lg"
            className={`relative h-16 px-12 text-lg font-body font-semibold transition-all duration-400 rounded-2xl shadow-lg mood-transition ${
              analysisState === 'analyzing'
                ? 'bg-muted cursor-not-allowed opacity-60'
                : 'mood-glow-hover hover:scale-105 active:scale-95'
            }`}
            data-testid="button-analyze-voice"
          >
            <span className="relative flex items-center gap-3">
              {analysisState === 'analyzing' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  {videoEnabled && modelsLoaded ? <Video className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  Start {videoEnabled && modelsLoaded ? 'Video + Voice' : 'Voice'} Analysis
                </>
              )}
            </span>
          </Button>

          {/* Camera Toggle */}
          {modelsLoaded && analysisState === 'idle' && (
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-primary/20 text-foreground hover-elevate transition-all duration-300"
              data-testid="button-toggle-camera"
            >
              {videoEnabled ? (
                <>
                  <Video className="w-5 h-5 text-primary" />
                  <span className="text-sm font-body font-medium">Camera Enabled</span>
                </>
              ) : (
                <>
                  <VideoOff className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-body font-medium">Voice Only</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Info Text */}
        <div className="mt-10 text-center space-y-3">
          <p className="text-muted-foreground text-base font-body">
            {videoEnabled ? 'Camera and microphone access required.' : 'Microphone access required.'}
          </p>
          <p className="text-muted-foreground text-sm font-body leading-relaxed max-w-2xl mx-auto">
            Speak naturally for 18 seconds - {videoEnabled ? 'our AI analyzes your facial expressions, words, and voice tone' : 'our AI analyzes the words you say and your voice tone'}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
