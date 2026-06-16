/**
 * HLS Video Engine Controller
 */

let hlsInstance = null;
let currentChannelName = "";
let currentChannelLogo = "";

/**
 * Initialize components when player view is switched on
 */
function initPlayerView() {
  const overlay = document.getElementById('player-controls-overlay');
  if (overlay) {
    overlay.classList.remove('opacity-0');
    // Hide controls after 5 seconds of inactivity
    resetControlsTimeout();
  }
}

/**
 * Start streaming dynamic playlist url
 * @param {string} streamUrl 
 * @param {string} channelName 
 * @param {string} channelLogo 
 */
function startHlsPlayer(streamUrl, channelName, channelLogo) {
  currentChannelName = channelName;
  currentChannelLogo = channelLogo;

  const video = document.getElementById('hls-video-element');
  const logoEl = document.getElementById('player-channel-logo');
  const nameEl = document.getElementById('player-channel-name');
  const programEl = document.getElementById('player-program-title');

  if (nameEl) nameEl.textContent = channelName;
  if (programEl) programEl.textContent = "Live Stream (Standard Playback)";
  
  if (logoEl) {
    if (channelLogo) {
      logoEl.innerHTML = `<img src="${channelLogo}" class="w-full h-full object-contain" alt="${channelName}">`;
    } else {
      logoEl.innerHTML = channelName.substring(0, 3).toUpperCase();
    }
  }

  // Clear existing instances
  stopHlsPlayer();

  if (!video) return;

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      maxMaxBufferLength: 10,
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(e => console.warn("Auto play prevented", e));
    });
    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("Fatal network error encountered, trying to recover...");
            hlsInstance.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("Fatal media error encountered, trying to recover...");
            hlsInstance.recoverMediaError();
            break;
          default:
            stopHlsPlayer();
            break;
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native support (Safari/iOS WebView/Some Smart TVs)
    video.src = streamUrl;
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(e => console.warn("Native auto play prevented", e));
    });
  } else {
    alert("Streaming not supported on this TV device configuration.");
  }
}

/**
 * Stop stream and release HLS Instance resources
 */
function stopHlsPlayer() {
  const video = document.getElementById('hls-video-element');
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  if (video) {
    video.pause();
    video.src = "";
    video.load();
  }
}

let controlsTimer = null;
function resetControlsTimeout() {
  const overlay = document.getElementById('player-controls-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('opacity-0');
  
  clearTimeout(controlsTimer);
  controlsTimer = setTimeout(() => {
    // Hide unless focused on controls specifically
    const active = document.activeElement;
    if (active && active.closest('#player-controls-overlay')) {
      resetControlsTimeout(); // Re-trigger if user interacting
    } else {
      overlay.classList.add('opacity-0');
    }
  }, 5000);
}

// Attach listener to trigger visibility on any D-Pad keydown inside Player
document.addEventListener('keydown', (e) => {
  const activeScreen = screens.find(id => !document.getElementById(id).classList.contains('hidden'));
  if (activeScreen === 'player-screen') {
    resetControlsTimeout();
  }
});
