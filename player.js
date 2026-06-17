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

  const statusOverlay = document.getElementById('player-status-overlay');
  const statusText = document.getElementById('player-status-text');
  const statusIcon = document.getElementById('player-status-icon');

  function showStatus(text, spin = true) {
    if (statusOverlay && statusText && statusIcon) {
      statusText.textContent = text;
      statusOverlay.classList.remove('hidden');
      if (spin) {
        statusIcon.classList.add('animate-spin');
        statusIcon.textContent = 'sync';
      } else {
        statusIcon.classList.remove('animate-spin');
        statusIcon.textContent = 'error';
      }
    }
  }

  function hideStatus() {
    if (statusOverlay) {
      statusOverlay.classList.add('hidden');
    }
  }

  showStatus("Loading Stream...");

  if (!video) return;

  // Video element events to control loading state
  video.onwaiting = () => {
    showStatus("Buffering Stream...");
  };
  video.onplaying = () => {
    hideStatus();
    // Mark channel as working to skip filtering/warning if working
    markChannelWorking(streamUrl);
  };
  video.onerror = () => {
    showStatus("Failed to Load Stream", false);
    markChannelBroken(streamUrl);
  };

  let playbackTimeout = setTimeout(() => {
    if (video.paused || video.readyState < 3) {
      showStatus("Stream Timeout / Offline", false);
      markChannelBroken(streamUrl);
    }
  }, 10000); // 10s connection timeout fallback

  // Helper functions to mark channels working/broken in runtime memory
  if (typeof window.brokenUrls === 'undefined') {
    window.brokenUrls = new Set();
  }
  if (typeof window.workingUrls === 'undefined') {
    window.workingUrls = new Set();
  }

  window.markChannelBroken = function(url) {
    window.brokenUrls.add(url);
    window.workingUrls.delete(url);
    // Visual indicators updates on channel list
    updateChannelUIStatus(url, false);
  };

  window.markChannelWorking = function(url) {
    window.workingUrls.add(url);
    window.brokenUrls.delete(url);
    updateChannelUIStatus(url, true);
  };

  function updateChannelUIStatus(url, isWorking) {
    const buttons = document.querySelectorAll('.dashboard-channel-item, .search-result-item');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-url') === url) {
        let statusBadge = btn.querySelector('.status-indicator');
        if (!statusBadge) {
          statusBadge = document.createElement('span');
          statusBadge.className = 'status-indicator font-label-sm text-label-sm ml-2 px-1 rounded text-[10px]';
          const titleContainer = btn.querySelector('.flex.flex-col') || btn;
          const titleRow = titleContainer.querySelector('.flex.items-center') || titleContainer;
          titleRow.appendChild(statusBadge);
        }
        if (isWorking) {
          statusBadge.textContent = 'ONLINE';
          statusBadge.className = 'status-indicator font-label-sm text-label-sm ml-2 px-1 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30';
          btn.style.opacity = '1.0';
        } else {
          statusBadge.textContent = 'OFFLINE';
          statusBadge.className = 'status-indicator font-label-sm text-label-sm ml-2 px-1 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30';
          btn.style.opacity = '0.5';
        }
      }
    });
  }

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      maxMaxBufferLength: 10,
      enableWorker: true,
      lowLatencyMode: true,
      manifestLoadingTimeOut: 8000,
      manifestLoadingMaxRetry: 3,
      levelLoadingTimeOut: 8000,
      levelLoadingMaxRetry: 3
    });
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      clearTimeout(playbackTimeout);
      video.play().catch(e => {
        console.warn("Auto play prevented", e);
        showStatus("Press Play to Start Stream", false);
      });
    });
    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        clearTimeout(playbackTimeout);
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("Fatal network error encountered, trying to recover...");
            showStatus("Network Error. Retrying...");
            hlsInstance.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("Fatal media error encountered, trying to recover...");
            showStatus("Media Error. Recovering...");
            hlsInstance.recoverMediaError();
            break;
          default:
            stopHlsPlayer();
            showStatus("Failed to load stream", false);
            break;
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native support (Safari/iOS WebView/Some Smart TVs)
    video.src = streamUrl;
    video.addEventListener('loadedmetadata', () => {
      clearTimeout(playbackTimeout);
      video.play().catch(e => {
        console.warn("Native auto play prevented", e);
        showStatus("Press Play to Start Stream", false);
      });
    });
  } else {
    clearTimeout(playbackTimeout);
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
    video.removeAttribute('src');
    video.load();
  }
  const statusOverlay = document.getElementById('player-status-overlay');
  if (statusOverlay) {
    statusOverlay.classList.add('hidden');
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
