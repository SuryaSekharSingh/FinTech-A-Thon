import { signalingServer, user_id } from './app.js';

// 🔊 Core Configuration
const VOICE_CONFIG = {
  SAMPLE_RATE: 16000,
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  ML_CHUNK_INTERVAL: 5000, // Send data to ML model every 5 seconds
  MIN_STATEMENT_LENGTH: 3 // Minimum number of words to consider as a statement
};

// 🌐 Global State
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let speechRecognizer = null;
let iceQueue = [];
let remoteUserId = null;

// 🎧 Audio Elements
const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');

// 🗂️ Transcription Buffer
let transcriptBuffer = '';
let mlChunkTimer = null;

// 🚀 Core Call System
export async function startCall() {
  try {
    remoteUserId = prompt("Enter recipient ID:");
    if (!remoteUserId) return;

    await initializeSystem();
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      voiceActivityDetection: false
    });
    await peerConnection.setLocalDescription(offer);
    sendSignal({ type: 'offer', offer });
  } catch (error) {
    handleError('Call initialization failed', error);
  }
}

async function initializeSystem() {
  resetState();
  
  // 1. Audio Acquisition
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: VOICE_CONFIG.SAMPLE_RATE,
      noiseSuppression: true,
      echoCancellation: true,
      channelCount: 1
    }
  });

  // 2. Audio Element Setup
  localAudio.srcObject = localStream;
  localAudio.muted = true;
  document.body.addEventListener('click', () => {
    localAudio.play().catch(console.warn);
    remoteAudio.play().catch(console.warn);
  }, { once: true });

  // 3. Peer Connection
  peerConnection = new RTCPeerConnection({
    iceServers: VOICE_CONFIG.ICE_SERVERS,
    iceTransportPolicy: 'all'
  });

  // 4. Track Handling
  localStream.getTracks().forEach(track => 
    peerConnection.addTrack(track, localStream)
  );

  peerConnection.ontrack = ({ streams: [stream] }) => {
    remoteStream = stream;
    remoteAudio.srcObject = remoteStream;
    console.log('🔊 Remote audio stream received');
    
    // Auto-play with fallback
    const tryPlay = () => {
      remoteAudio.play()
        .catch(() => document.body.addEventListener('click', tryPlay, { once: true }));
    };
    tryPlay();
  };

  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      sendSignal({ type: 'ice', candidate });
      console.log('❄️ Sent ICE candidate');
    }
  };

  // 5. Speech Recognition
  initSpeechRecognition();
}

// 🎙️ Speech Processing
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechRecognizer = new SpeechRecognition();
  
  speechRecognizer.continuous = true;
  speechRecognizer.interimResults = true;
  speechRecognizer.lang = 'en-US';

  speechRecognizer.onresult = ({ results }) => {
    const transcripts = [];
    for (let i = 0; i < results.length; i++) {
      transcripts.push(results[i][0].transcript);
    }
    const fullText = transcripts.join(' ');
    console.log('📝 Live Transcript:', fullText);

    // Append to transcript buffer
    transcriptBuffer += fullText + ' ';

    // Start ML chunk timer if not already running
    if (!mlChunkTimer) {
      mlChunkTimer = setInterval(() => {
        if (transcriptBuffer.trim()) {
          const statements = splitIntoStatements(transcriptBuffer.trim());
          statements.forEach(statement => {
            if (statement.split(' ').length >= VOICE_CONFIG.MIN_STATEMENT_LENGTH) {
              sendToMLModel(statement);
            }
          });
          transcriptBuffer = ''; // Clear buffer after sending
        }
      }, VOICE_CONFIG.ML_CHUNK_INTERVAL);
    }
  };

  speechRecognizer.onerror = (error) => {
    console.warn('Speech recognition error:', error);
    if (error.error !== 'aborted') {
      setTimeout(() => speechRecognizer.start(), 50);
    }
  };

  speechRecognizer.start();
}

// 🔧 Utility: Split text into meaningful statements
function splitIntoStatements(text) {
  // Split by punctuation or newlines
  return text.split(/[.!?]\s+|\n+/).filter(s => s.trim());
}

// 📡 Signaling System
export function sendSignal(data) {
  if (!signalingServer || signalingServer.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected');
    setTimeout(() => sendSignal(data), 500);
    return;
  }

  const payload = JSON.stringify({
    ...data,
    from: user_id,
    to: remoteUserId,
    timestamp: Date.now()
  });

  try {
    signalingServer.send(payload);
    console.log('📤 Sent signal:', data.type);
  } catch (error) {
    console.error('Signal send error:', error);
    setTimeout(() => sendSignal(data), 500);
  }
}

// 🛠️ Connection Handlers
signalingServer.onmessage = async ({ data }) => {
  try {
    const message = JSON.parse(data);
    console.log('📥 Received signal:', message.type);
    
    switch(message.type) {
      case 'offer':
        await handleOffer(message);
        break;
      case 'answer':
        await handleAnswer(message);
        break;
      case 'ice':
        handleIceCandidate(message.candidate);
        break;
    }
  } catch (error) {
    handleError('Signal handling error', error);
  }
};

async function handleOffer({ offer, from }) {
  remoteUserId = from;
  await initializeSystem();
  
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  sendSignal({ type: 'answer', answer });
}

async function handleAnswer({ answer }) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  processIceQueue();
}

function handleIceCandidate(candidate) {
  const ice = new RTCIceCandidate(candidate);
  if (peerConnection.remoteDescription) {
    peerConnection.addIceCandidate(ice);
    console.log('✅ Added ICE candidate');
  } else {
    iceQueue.push(ice);
    console.log('📦 Queued ICE candidate');
  }
}

function processIceQueue() {
  iceQueue.forEach(candidate => 
    peerConnection.addIceCandidate(candidate)
  );
  iceQueue = [];
}

// 🧼 Cleanup
function resetState() {
  if (peerConnection) {
    peerConnection.ontrack = null;
    peerConnection.onicecandidate = null;
    peerConnection.close();
  }
  
  localStream?.getTracks().forEach(track => track.stop());
  remoteStream?.getTracks().forEach(track => track.stop());
  speechRecognizer?.stop();
  
  // Clear ML chunk timer
  if (mlChunkTimer) {
    clearInterval(mlChunkTimer);
    mlChunkTimer = null;
  }

  peerConnection = null;
  localStream = null;
  remoteStream = null;
  iceQueue = [];
  transcriptBuffer = '';
}

function handleError(context, error) {
  console.error(`${context}:`, error);
  resetState();
}

// 🛠️ ML Integration with Notifications
async function sendToMLModel(text) {
  try {
    const response = await fetch('https://3277-2409-40f4-1009-7efd-7477-aad-a9a1-154f.ngrok-free.app/predict', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    console.log('ML Model Response:', data);

    // Handle scam detection with notifications
    if (data.prediction === "SCAM") {
      const probability = data.scam_probability.toFixed(2);
      
      // Request notification permission if not already granted
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }

      // Show notification based on probability
      if (Notification.permission === 'granted') {
        if (probability >= 0.7) {
          new Notification('🚨 Scam Detected!', {
            body: `High probability of scam (${probability}). Be cautious!`,
            icon: '⚠️', // Emoji as icon
            requireInteraction: true // Keeps the notification visible until dismissed
          });
        } else if (probability >= 0.4) {
          new Notification('⚠️ Potential Scam', {
            body: `This might be a scam (${probability}). Proceed with caution.`,
            icon: '🔍' // Emoji as icon
          });
        }
      }
    }
  } catch (error) {
    console.error('ML API error:', error);
  }
}

// Initialize
window.addEventListener('beforeunload', resetState);
console.log('🎧 Voice Call System Active');