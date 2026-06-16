/**
 * IPTV Playlist Parser & Storage Loader
 */

const IPTV_PLAYLIST_KEY = 'stitch_iptv_playlist_channels';

// Default backup channel list (in case network fetch fails/is blocked)
const DEFAULT_CHANNELS = [
  {
    name: "DD National",
    url: "https://ddsports.bhaskar.com/ddsports/live.m3u8",
    category: "General",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Doordarshan_logo.svg"
  },
  {
    name: "DD Sports",
    url: "https://ddsports.bhaskar.com/ddsports/live.m3u8",
    category: "Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/DD_Sports_logo.svg"
  },
  {
    name: "DD News",
    url: "https://ddsports.bhaskar.com/ddsports/live.m3u8",
    category: "News",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5a/DD_News_logo.svg"
  },
  {
    name: "Sansad TV LSTV",
    url: "https://ddsports.bhaskar.com/ddsports/live.m3u8",
    category: "News",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Sansad_TV_logo.svg"
  }
];

/**
 * Parses raw M3U string into clean Channel structures
 * @param {string} rawText 
 * @returns {Array} List of channel objects
 */
function parseM3U(rawText) {
  const lines = rawText.split('\n');
  const channels = [];
  let currentChannel = null;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      // Parse tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      currentChannel.logo = logoMatch ? logoMatch[1] : '';

      // Parse group-title/category
      const groupMatch = line.match(/group-title="([^"]+)"/);
      currentChannel.category = groupMatch ? groupMatch[1] : 'General';

      // Parse channel name (anything after the last comma)
      const commaIdx = line.lastIndexOf(',');
      if (commaIdx !== -1) {
        currentChannel.name = line.substring(commaIdx + 1).trim();
      } else {
        currentChannel.name = 'Unknown Channel';
      }
    } else if (line.startsWith('http')) {
      if (currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = null;
      }
    }
  }
  return channels;
}

/**
 * Loads playlist from localStorage or fetches from external resource, fallback to default.
 */
async function loadChannels() {
  const statusEl = document.getElementById('splash-status');
  if (statusEl) statusEl.textContent = "Loading cached channels...";

  // Check LocalStorage cache first
  const cached = localStorage.getItem(IPTV_PLAYLIST_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.length > 0) {
        if (statusEl) statusEl.textContent = `Loaded ${parsed.length} channels!`;
        return parsed;
      }
    } catch (e) {
      console.error("Failed parsing cached channels, refetching...", e);
    }
  }

  if (statusEl) statusEl.textContent = "Fetching India/Hindi channels playlist...";
  
  try {
    // Attempting to fetch public m3u list
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout limit

    // Using India-specific IPTV-org lists for speed and regional focus
    const response = await fetch('https://iptv-org.github.io/iptv/countries/in.m3u', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      const parsedChannels = parseM3U(text);
      if (parsedChannels.length > 0) {
        localStorage.setItem(IPTV_PLAYLIST_KEY, JSON.stringify(parsedChannels));
        if (statusEl) statusEl.textContent = `Imported ${parsedChannels.length} Indian IPTV channels!`;
        return parsedChannels;
      }
    }
  } catch (err) {
    console.warn("Failed fetching live m3u database, loading defaults...", err);
  }

  // Fallback
  if (statusEl) statusEl.textContent = "Loading built-in streams...";
  localStorage.setItem(IPTV_PLAYLIST_KEY, JSON.stringify(DEFAULT_CHANNELS));
  return DEFAULT_CHANNELS;
}
