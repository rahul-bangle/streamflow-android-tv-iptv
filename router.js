/**
 * TV Remote Listener & D-pad Router for IPTV SPA Shell
 */

const screens = ['dashboard-screen', 'search-screen', 'category-screen', 'player-screen'];
let currentScreenIdx = 0; // Starts at dashboard after splash hides
let focusedElement = null;
let appChannels = [];
let currentCategory = "News";

const VIRTUAL_KEYS = [
  'A', 'B', 'C', 'D', 'E', 'F',
  'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R',
  'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z', 'Space', 'Back'
];

/**
 * Handle screen switching
 */
function switchScreen(screenId) {
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Handle sidebar showing/hiding context
  const sidebar = document.getElementById('shared-sidebar');
  const header = document.getElementById('shared-header');
  
  if (screenId === 'player-screen') {
    if (sidebar) sidebar.classList.add('hidden');
    if (header) header.classList.add('hidden');
    // Initialize full player logic
    initPlayerView();
  } else {
    if (sidebar) sidebar.classList.remove('hidden');
    if (header) header.classList.remove('hidden');
    
    // Stop HLS video when leaving fullscreen player
    stopHlsPlayer();
  }

  // Refocus default item on new screen
  setTimeout(() => {
    refocusDefault(screenId);
  }, 100);
}

/**
 * Refocus default component item on standard screen activation
 */
function refocusDefault(screenId) {
  if (screenId === 'dashboard-screen') {
    const channels = document.querySelectorAll('#dashboard-channels-list button');
    if (channels.length > 0) {
      focusElement(channels[0]);
    } else {
      focusElement(document.getElementById('dashboard-preview-card'));
    }
  } else if (screenId === 'search-screen') {
    const firstKey = document.querySelector('#virtual-keyboard button');
    if (firstKey) focusElement(firstKey);
  } else if (screenId === 'category-screen') {
    const gridItems = document.querySelectorAll('#category-grid button');
    if (gridItems.length > 0) focusElement(gridItems[0]);
  } else if (screenId === 'player-screen') {
    focusElement(document.getElementById('player-play-btn'));
  }
}

/**
 * Focus element outline standard
 */
function focusElement(el) {
  if (!el) return;
  if (focusedElement) {
    focusedElement.classList.remove('focused');
    focusedElement.blur();
  }
  focusedElement = el;
  focusedElement.classList.add('focused');
  focusedElement.focus();

  // Custom preview display on hover/focus change in Dashboard Channel list
  if (focusedElement.classList.contains('dashboard-channel-item')) {
    const index = parseInt(focusedElement.getAttribute('data-index'));
    if (!isNaN(index) && appChannels[index]) {
      updatePreviewPanel(appChannels[index]);
    }
  }
}

/**
 * Update the Preview Panel Details in Dashboard layout
 */
function updatePreviewPanel(channel) {
  document.getElementById('dashboard-preview-title').textContent = channel.name;
  document.getElementById('dashboard-preview-desc').textContent = `Now Playing Live Stream Category: ${channel.category}. Press ENTER to play Fullscreen.`;
  const logoPlaceholder = document.getElementById('dashboard-preview-logo-placeholder');
  if (channel.logo) {
    logoPlaceholder.innerHTML = `<img src="${channel.logo}" class="w-full h-full object-contain" alt="Logo">`;
  } else {
    logoPlaceholder.textContent = channel.name.substring(0, 3).toUpperCase();
  }
  
  const bg = document.getElementById('dashboard-preview-bg');
  if (channel.logo) {
    bg.style.backgroundImage = `url('${channel.logo}')`;
  } else {
    bg.style.backgroundImage = 'none';
  }
}

/**
 * Populate Dashboard with channels filtering by category
 */
function populateDashboardChannels(channels, category = "News") {
  const listEl = document.getElementById('dashboard-channels-list');
  const countEl = document.getElementById('dashboard-channel-count');
  const titleEl = document.getElementById('dashboard-category-title');
  
  if (!listEl) return;
  listEl.innerHTML = '';
  
  titleEl.textContent = `${category} Channels`;
  
  const filtered = channels.filter(c => c.category.toLowerCase() === category.toLowerCase() || category === 'All');
  countEl.textContent = `${filtered.length} Channels`;

  filtered.forEach((ch, idx) => {
    // Find index of this channel in master array
    const masterIdx = channels.indexOf(ch);
    const item = document.createElement('button');
    item.className = 'dashboard-channel-item tv-focusable tv-transition flex items-center p-4 rounded-xl bg-surface-container-high w-full text-left';
    item.setAttribute('tabindex', '0');
    item.setAttribute('data-index', masterIdx);
    
    const logoHtml = ch.logo ? 
      `<img src="${ch.logo}" class="w-16 h-12 object-contain mr-4 rounded bg-white flex-shrink-0" onerror="this.style.display='none'">` :
      `<div class="w-16 h-12 bg-white rounded flex items-center justify-center mr-4 flex-shrink-0 text-black font-bold text-sm">${ch.name.substring(0,3).toUpperCase()}</div>`;
      
    item.innerHTML = `
      <span class="font-label-lg text-label-lg text-on-surface-variant w-12 flex-shrink-0">${idx + 1}</span>
      ${logoHtml}
      <div class="flex flex-col overflow-hidden">
        <span class="font-label-lg text-label-lg text-on-surface font-semibold truncate">${ch.name}</span>
        <div class="flex items-center space-x-2 mt-1">
          <span class="font-label-sm text-label-sm text-primary-container border border-primary-container px-1 rounded text-[10px] bg-primary-container/10">LIVE</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${ch.category}</span>
        </div>
      </div>
    `;

    item.addEventListener('click', () => {
      // Switch to Fullscreen Player with this channel url
      playChannelFullScreen(ch);
    });

    listEl.appendChild(item);
  });
  
  // Set default initial preview to first channel
  if (filtered.length > 0) {
    updatePreviewPanel(filtered[0]);
  }
}

/**
 * Play selected channel in fullscreen
 */
function playChannelFullScreen(channel) {
  switchScreen('player-screen');
  startHlsPlayer(channel.url, channel.name, channel.logo);
}

/**
 * Build Category Screen Bento-grid
 */
function buildCategoryScreen() {
  const grid = document.getElementById('category-grid');
  if (!grid) return;
  
  // Extract unique categories
  const categories = ['All', ...new Set(appChannels.map(c => c.category))];
  grid.innerHTML = '';
  
  categories.forEach((cat, idx) => {
    const count = cat === 'All' ? appChannels.length : appChannels.filter(c => c.category === cat).length;
    const btn = document.createElement('button');
    // Alternate sizing for bento feel
    const isLarge = idx < 2;
    btn.className = `${isLarge ? 'col-span-2 row-span-2 h-[240px]' : 'col-span-2 row-span-1 h-[112px]'} relative rounded-xl overflow-hidden group tv-focusable text-left bg-surface-container flex flex-col justify-between p-6 border border-white/5`;
    btn.setAttribute('tabindex', '0');
    
    btn.innerHTML = `
      <span class="material-symbols-outlined text-4xl text-primary-container">${idx % 2 === 0 ? 'newspaper' : 'explore'}</span>
      <div>
        <h3 class="font-headline-md text-headline-md text-on-surface">${cat}</h3>
        <p class="font-label-lg text-label-lg text-on-surface-variant mt-1">${count} Channels</p>
      </div>
    `;
    
    btn.addEventListener('click', () => {
      currentCategory = cat;
      populateDashboardChannels(appChannels, cat);
      switchScreen('dashboard-screen');
    });
    
    grid.appendChild(btn);
  });
}

/**
 * Setup virtual keyboard structure
 */
function buildVirtualKeyboard() {
  const kb = document.getElementById('virtual-keyboard');
  if (!kb) return;
  kb.innerHTML = '';
  
  VIRTUAL_KEYS.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'tv-focusable h-16 rounded-lg bg-surface-container-high text-headline-md font-bold flex items-center justify-center border border-white/5';
    btn.setAttribute('tabindex', '0');
    btn.textContent = key;
    
    btn.addEventListener('click', () => {
      const input = document.getElementById('search-input-field');
      if (key === 'Space') {
        input.value += ' ';
      } else if (key === 'Back') {
        input.value = input.value.slice(0, -1);
      } else {
        input.value += key;
      }
      triggerSearchQuery(input.value);
    });
    
    kb.appendChild(btn);
  });
}

/**
 * Handle Live Filter based on search input value
 */
function triggerSearchQuery(query) {
  const resultsEl = document.getElementById('search-results-list');
  if (!resultsEl) return;
  resultsEl.innerHTML = '';
  
  if (!query || query.trim() === '') {
    resultsEl.innerHTML = '<p class="text-on-surface-variant p-4 text-center">Start typing to search channels...</p>';
    return;
  }
  
  const matches = appChannels.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  if (matches.length === 0) {
    resultsEl.innerHTML = '<p class="text-on-surface-variant p-4 text-center">No matching channels found.</p>';
    return;
  }
  
  matches.forEach(ch => {
    const item = document.createElement('button');
    item.className = 'search-result-item tv-focusable tv-transition flex items-center p-4 rounded-xl bg-surface-container-high w-full text-left';
    item.setAttribute('tabindex', '0');
    
    const logoHtml = ch.logo ? 
      `<img src="${ch.logo}" class="w-12 h-10 object-contain mr-4 rounded bg-white flex-shrink-0" onerror="this.style.display='none'">` :
      `<div class="w-12 h-10 bg-white rounded flex items-center justify-center mr-4 flex-shrink-0 text-black font-bold text-sm">${ch.name.substring(0,2).toUpperCase()}</div>`;
      
    item.innerHTML = `
      ${logoHtml}
      <div class="flex flex-col">
        <span class="font-label-lg text-label-lg text-on-surface font-semibold">${ch.name}</span>
        <span class="text-xs text-on-surface-variant">${ch.category}</span>
      </div>
    `;
    
    item.addEventListener('click', () => {
      playChannelFullScreen(ch);
    });
    
    resultsEl.appendChild(item);
  });
}

/**
 * Handle remote keydown operations
 */
function handleKeyDown(e) {
  const active = document.activeElement;
  if (!active) return;
  
  // Back/Escape key mapping
  if (e.key === 'Escape' || e.key === 'Backspace' && active.tagName !== 'INPUT') {
    e.preventDefault();
    const activeScreen = screens.find(id => !document.getElementById(id).classList.contains('hidden'));
    if (activeScreen === 'player-screen') {
      switchScreen('dashboard-screen');
    } else if (activeScreen === 'search-screen' || activeScreen === 'category-screen') {
      switchScreen('dashboard-screen');
    }
    return;
  }

  // Handle D-pad movement mapping grid coordinates
  const focusables = Array.from(document.querySelectorAll('.focused, .tv-focusable, .tv-focusable-sidebar'));
  const idx = focusables.indexOf(active);
  if (idx === -1) return;
  
  let nextIdx = idx;
  
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    // Grid horizontal navigation shift
    if (active.id === 'nav-dashboard' || active.id === 'nav-search' || active.id === 'nav-category' || active.id === 'nav-settings') {
      // Go to screen main content
      refocusDefault(screens[currentScreenIdx]);
    } else {
      nextIdx = Math.min(idx + 1, focusables.length - 1);
      focusElement(focusables[nextIdx]);
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    // Move to navigation sidebar
    focusElement(document.getElementById('nav-dashboard'));
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    // Shift vertically downwards
    nextIdx = Math.min(idx + 1, focusables.length - 1);
    focusElement(focusables[nextIdx]);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    nextIdx = Math.max(idx - 1, 0);
    focusElement(focusables[nextIdx]);
  }
}

// Global initialization hook
window.addEventListener('DOMContentLoaded', async () => {
  // Setup clock ticking
  setInterval(() => {
    const clock = document.getElementById('clock-display');
    const playerTime = document.getElementById('player-time');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (clock) clock.textContent = timeStr;
    if (playerTime) playerTime.textContent = timeStr;
  }, 1000);

  // Initialize and load channels
  appChannels = await loadChannels();
  
  // Setup views
  populateDashboardChannels(appChannels, currentCategory);
  buildCategoryScreen();
  buildVirtualKeyboard();
  
  // Hide splash and reveal router workspace
  const splash = document.getElementById('splash-screen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('hidden');
      switchScreen('dashboard-screen');
    }, 1500);
  }

  // Bind D-pad navigation listeners
  document.addEventListener('keydown', handleKeyDown);
  
  // Setup Sidebar clicks
  document.getElementById('nav-dashboard').addEventListener('click', () => switchScreen('dashboard-screen'));
  document.getElementById('nav-search').addEventListener('click', () => switchScreen('search-screen'));
  document.getElementById('nav-category').addEventListener('click', () => switchScreen('category-screen'));
});
