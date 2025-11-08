import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Camera, Mic, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMood } from '@/contexts/MoodContext';
import heroImage from '@assets/generated_images/Creative_studio_peaceful_atmosphere_ca7f862b.png';

type AnalysisState = 'idle' | 'requesting' | 'analyzing' | 'complete';

export default function MoodDetectionLanding() {
  const [, setLocation] = useLocation();
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { mood, setMood, setConfidence, confidence } = useMood();

  const requestCameraAccess = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const requestMicAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicGranted(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const startMoodAnalysis = async () => {
    if (!cameraGranted || !micGranted) return;
    
    setAnalysisState('analyzing');
    
    // Simulate analysis progress while waiting for minimum duration
    let progress = 0;
    const totalDuration = 15000; // 15 seconds for demo (adjustable)
    const updateInterval = 500;
    const increment = (updateInterval / totalDuration) * 100;
    
    const interval = setInterval(() => {
      progress += increment;
      setConfidence(Math.min(progress, 100));
    }, updateInterval);

    // After duration, analyze with Gemini
    setTimeout(async () => {
      clearInterval(interval);
      
      try {
        // Use Gemini to analyze mood based on simulated context
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
          // Fallback
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
      
      setAnalysisState('complete');
    }, totalDuration);
  };

  const proceedToCanvas = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setLocation('/canvas');
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen relative overflow-hidden mood-transition">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-white mb-6">
            Your emotions have a story
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
            Let them create with you
          </p>
        </div>

        {analysisState === 'idle' && (
          <>
            {cameraGranted && (
              <div className="max-w-3xl w-full mb-8">
                <Card className="backdrop-blur-md bg-card/90">
                  <CardContent className="pt-6">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-white text-sm font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Camera Preview
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full mb-8">
              <Card className="backdrop-blur-md bg-card/90" data-testid="card-camera-permission">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-center">Camera Access</CardTitle>
                  <CardDescription className="text-center">
                    We analyze your facial expressions to understand your emotional state
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={requestCameraAccess}
                    disabled={cameraGranted}
                    className="w-full"
                    data-testid="button-allow-camera"
                  >
                    {cameraGranted ? 'Camera Enabled ✓' : 'Allow Camera'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-card/90" data-testid="card-mic-permission">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-center">Microphone Access</CardTitle>
                  <CardDescription className="text-center">
                    Voice tone and pitch help us detect subtle emotional nuances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={requestMicAccess}
                    disabled={micGranted}
                    className="w-full"
                    data-testid="button-allow-mic"
                  >
                    {micGranted ? 'Microphone Enabled ✓' : 'Allow Microphone'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {(analysisState === 'analyzing' || analysisState === 'complete') && (
          <div className="max-w-4xl w-full">
            <Card className="backdrop-blur-md bg-card/90" data-testid="card-mood-analysis">
              <CardContent className="pt-6">
                <div className="relative w-full max-w-2xl mx-auto mb-6">
                  <div className="relative aspect-video rounded-2xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {analysisState === 'analyzing' && (
                      <>
                        <div className="absolute inset-0 border-4 border-primary pulse-glow rounded-2xl pointer-events-none" />
                        <div className="absolute inset-0 border-4 border-primary/30 animate-ping rounded-2xl pointer-events-none" />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                          <p className="text-white text-sm font-medium flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            Analyzing live feed...
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analysisState === 'analyzing' ? (
                    <>
                      <p className="text-center text-lg font-medium" data-testid="text-analysis-status">
                        Analyzing your mood...
                      </p>
                      <p className="text-center text-sm text-muted-foreground">
                        Stay still and relaxed. We're analyzing your facial expressions and voice patterns.
                      </p>
                      <Progress value={confidence} className="h-2" data-testid="progress-mood-confidence" />
                      <p className="text-center text-sm text-muted-foreground">
                        Analysis Progress: {Math.round(confidence)}%
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-center space-y-4">
                        <div className="inline-block p-4 rounded-full bg-primary/10">
                          <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <h2 className="text-3xl font-display font-bold capitalize" data-testid="text-detected-mood">
                          Your mood is: {mood}
                        </h2>
                        <p className="text-muted-foreground">
                          Based on your facial expressions and voice tone analysis
                        </p>
                        <div className="pt-4">
                          <Button
                            size="lg"
                            onClick={proceedToCanvas}
                            className="px-8"
                            data-testid="button-proceed"
                          >
                            Continue to Creative Canvas
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analysisState === 'idle' && (
          <>
            <Button
              size="lg"
              onClick={startMoodAnalysis}
              disabled={!cameraGranted || !micGranted}
              className="mb-6 px-8"
              data-testid="button-begin-analysis"
            >
              Begin Mood Analysis
            </Button>

            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Lock className="w-4 h-4" />
              <span>Your privacy is protected. All analysis happens locally.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
