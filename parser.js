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

  // Clear stale raw channels cache if it exists to force loading of verified database
  const cached = localStorage.getItem(IPTV_PLAYLIST_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // If the cache contains the unfiltered raw list (753 channels), clear it
      if (parsed && parsed.length > 500) {
        localStorage.removeItem(IPTV_PLAYLIST_KEY);
      } else if (parsed && parsed.length > 0) {
        if (statusEl) statusEl.textContent = `Loaded ${parsed.length} channels!`;
        return parsed;
      }
    } catch (e) {
      console.error("Failed parsing cached channels, refetching...", e);
    }
  }

  if (statusEl) statusEl.textContent = "Fetching pre-filtered working channels...";
  
  try {
    // Attempting to fetch local verified working channels database
    const response = await fetch('working_channels.json');
    if (response.ok) {
      const parsedChannels = await response.json();
      if (parsedChannels.length > 0) {
        // Filter out any known dead offline URLs before caching
        const verifiedChannels = parsedChannels.filter(ch => {
          // Explicit filter criteria
          if (!ch.url || ch.url.includes("9xjio.wiseplayout.com") || ch.url.includes("thelegitpro.in") || ch.url.includes("103.72.101.252")) {
            return false;
          }
          return true;
        });
        localStorage.setItem(IPTV_PLAYLIST_KEY, JSON.stringify(verifiedChannels));
        if (statusEl) statusEl.textContent = `Imported ${verifiedChannels.length} active channels!`;
        return verifiedChannels;
      }
    }
  } catch (err) {
    console.warn("Failed loading working channels json, falling back to defaults...", err);
  }

  // Fallback
  if (statusEl) statusEl.textContent = "Loading built-in streams...";
  localStorage.setItem(IPTV_PLAYLIST_KEY, JSON.stringify(DEFAULT_CHANNELS));
  return DEFAULT_CHANNELS;
}
