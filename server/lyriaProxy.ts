import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { lyriaClient } from './gemini';

export function setupLyriaWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/lyria-session'
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('🎵 Client connected to Lyria session');
    
    let lyriaSession: any = null;
    let isConnected = false;

    try {
      // Connect to Lyria RealTime
      lyriaSession = await lyriaClient.live.music.connect({
        model: 'models/lyria-realtime-exp',
        callbacks: {
          onmessage: (message: any) => {
            // Relay audio chunks to client
            if (message.serverContent?.audioChunks) {
              for (const chunk of message.serverContent.audioChunks) {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({
                    type: 'audio',
                    data: chunk.data
                  }));
                }
              }
            }
          },
          onerror: (error: any) => {
            console.error('❌ Lyria session error:', error);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'error',
                message: error.message || 'Music generation error'
              }));
            }
          },
          onclose: () => {
            console.log('🔌 Lyria session closed');
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'complete' }));
            }
          }
        }
      });

      isConnected = true;
      
      // Notify client that connection is ready
      clientWs.send(JSON.stringify({ 
        type: 'ready',
        message: 'Connected to Lyria RealTime'
      }));

    } catch (error) {
      console.error('❌ Failed to connect to Lyria:', error);
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Failed to connect to music generation service'
      }));
      clientWs.close();
      return;
    }

    // Handle messages from client
    clientWs.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'configure':
            // Set music generation parameters
            if (lyriaSession && message.config) {
              await lyriaSession.setWeightedPrompts({
                weightedPrompts: message.config.prompts || []
              });
              
              await lyriaSession.setMusicGenerationConfig({
                musicGenerationConfig: {
                  bpm: message.config.bpm || 100,
                  temperature: message.config.temperature || 1.0,
                  audioFormat: 'pcm16',
                  sampleRateHz: 44100
                }
              });
              
              clientWs.send(JSON.stringify({
                type: 'configured',
                message: 'Music parameters set'
              }));
            }
            break;

          case 'play':
            // Start music generation
            if (lyriaSession) {
              await lyriaSession.play();
              clientWs.send(JSON.stringify({
                type: 'playing',
                message: 'Music generation started'
              }));
            }
            break;

          case 'pause':
            // Pause music generation
            if (lyriaSession) {
              await lyriaSession.pause();
              clientWs.send(JSON.stringify({
                type: 'paused',
                message: 'Music generation paused'
              }));
            }
            break;

          case 'stop':
            // Stop music generation
            if (lyriaSession) {
              await lyriaSession.stop();
              clientWs.send(JSON.stringify({
                type: 'stopped',
                message: 'Music generation stopped'
              }));
            }
            break;

          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error handling client message:', error);
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process command'
        }));
      }
    });

    // Cleanup on disconnect
    clientWs.on('close', () => {
      console.log('👋 Client disconnected from Lyria session');
      if (lyriaSession) {
        try {
          lyriaSession.stop();
        } catch (error) {
          console.error('Error stopping Lyria session:', error);
        }
      }
    });

    clientWs.on('error', (error) => {
      console.error('Client WebSocket error:', error);
    });
  });

  console.log('✅ Lyria WebSocket proxy ready at /ws/lyria-session');
  
  return wss;
}
