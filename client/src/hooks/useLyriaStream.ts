import { useState, useRef, useCallback, useEffect } from 'react';

interface LyriaConfig {
  prompts: Array<{ text: string; weight: number }>;
  bpm: number;
  temperature: number;
}

interface UseLyriaStreamReturn {
  isConnected: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  configure: (config: LyriaConfig) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export function useLyriaStream(): UseLyriaStreamReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array>(new Float32Array(0));
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      });
    }
    return audioContextRef.current;
  }, []);

  // Process incoming audio data
  const processAudioChunk = useCallback((base64Data: string) => {
    try {
      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM16 to Float32
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      // Add to audio queue
      const currentLength = audioQueueRef.current.length;
      const newBuffer = new Float32Array(currentLength + float32.length);
      newBuffer.set(audioQueueRef.current, 0);
      newBuffer.set(float32, currentLength);
      audioQueueRef.current = newBuffer;

    } catch (err) {
      console.error('Error processing audio chunk:', err);
    }
  }, []);

  // Set up audio playback
  const setupAudioPlayback = useCallback(() => {
    const audioContext = initAudioContext();
    
    if (!scriptNodeRef.current) {
      const bufferSize = 4096;
      scriptNodeRef.current = audioContext.createScriptProcessor(bufferSize, 0, 2);
      
      scriptNodeRef.current.onaudioprocess = (e) => {
        const outputL = e.outputBuffer.getChannelData(0);
        const outputR = e.outputBuffer.getChannelData(1);
        
        if (audioQueueRef.current.length >= bufferSize) {
          const samplesToPlay = audioQueueRef.current.subarray(0, bufferSize);
          outputL.set(samplesToPlay);
          outputR.set(samplesToPlay);
          audioQueueRef.current = audioQueueRef.current.subarray(bufferSize);
        } else {
          outputL.fill(0);
          outputR.fill(0);
        }
      };
      
      scriptNodeRef.current.connect(audioContext.destination);
    }
  }, [initAudioContext]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const wsUrl = `ws://${window.location.hostname}:${window.location.port}/ws/lyria-session`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('✅ Connected to Lyria session');
      setIsConnected(true);
      setIsLoading(false);
      setupAudioPlayback();
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'ready':
            console.log('🎵 Lyria ready:', message.message);
            break;
          
          case 'audio':
            processAudioChunk(message.data);
            break;
          
          case 'configured':
            console.log('⚙️ Configuration applied');
            break;
          
          case 'playing':
            setIsPlaying(true);
            break;
          
          case 'paused':
          case 'stopped':
            setIsPlaying(false);
            break;
          
          case 'complete':
            setIsPlaying(false);
            break;
          
          case 'error':
            setError(message.message);
            setIsPlaying(false);
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      setError('Connection error');
      setIsLoading(false);
    };

    wsRef.current.onclose = () => {
      console.log('🔌 Disconnected from Lyria session');
      setIsConnected(false);
      setIsPlaying(false);
      setIsLoading(false);
    };
  }, [setupAudioPlayback, processAudioChunk]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
    
    audioQueueRef.current = new Float32Array(0);
  }, []);

  // Configure music generation
  const configure = useCallback((config: LyriaConfig) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'configure',
        config
      }));
    }
  }, []);

  // Control playback
  const play = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'play' }));
    }
  }, []);

  const pause = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'pause' }));
    }
  }, []);

  const stop = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isPlaying,
    isLoading,
    error,
    connect,
    disconnect,
    configure,
    play,
    pause,
    stop
  };
}
