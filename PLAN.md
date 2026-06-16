# Custom Android IPTV Player Implementation Plan (Stitch Theme)

> **For Hermes:** Use supergsd-execute-task or subagent-driven-development to implement this plan task-by-task.

**Goal:** Build a high-fidelity, TV remote-compliant (D-Pad arrow key navigation) custom Android IPTV player app using the exact exported Stitch UI design templates (Slate dark color system, Netflix-red accents, and Inter typography scale) without making visual changes.

**Architecture:** 
- **Single Page Application (SPA) container** (`index.html`): Combines the 4 Stitch modules (`iptv_dashboard_live_tv`, `channel_list_news_category`, `immersive_video_player_full_screen`, `search_with_on_screen_keyboard`) into a unified DOM router.
- **D-Pad Keyboard Listeners & State Manager** (`router.js`): Maps physical remote keys (ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Enter, Escape/Back) to screen navigation, virtual keyboard selectors, focus outlines, and screen transitions.
- **IPTV Core Parser** (`parser.js`): Fetches and parses standard `.m3u` IPTV playlist channels dynamically (filtering for India/Hindi stream sets) and saves them in local storage.
- **HLS Video Engine**: Integrated player using `hls.js` targeting the full-screen player canvas window with program schedule metadata overlay (EPG).

**Tech Stack:**
- HTML5 / CSS3 / Tailwind CSS (CDN loaded)
- Vanilla JS (Zero heavy framework overhead, optimized for lightweight TV WebViews)
- `hls.js` (HLS stream playback)
- CapacitorJS or lightweight Android Studio template (For packing WebView assets into `.apk`)

---

## Tasks

### Task 1: Initialize Workspace and Project Directory Setup
**Objective:** Set up git branch, config dependencies, and copy files to the correct subfolder structure.
**Files:**
- Create: `E:/hermes/profiles/coder/workspace/android_iptv_player/PROJECT.md`
- Test: `tests/test_init.py`

**Step 1: Write failing test (RED)**
```python
import os
def test_workspace_files_exist():
    # Test checking if base project structures are set
    base_dir = "E:/hermes/profiles/coder/workspace/android_iptv_player"
    assert os.path.exists(os.path.join(base_dir, "PROJECT.md"))
    assert os.path.exists(os.path.join(base_dir, "cinematic_immersive/DESIGN.md"))
```

**Step 2: Run test to verify failure**
Run: `pytest tests/test_init.py`
Expected: FAIL (AssertionError)

**Step 3: Write minimal implementation (GREEN)**
Write project goals in `PROJECT.md` and verify directory sync.
Run: `git checkout -b agent/codesmith-iptv-init`

**Step 4: Run test to verify pass**
Run: `pytest tests/test_init.py`
Expected: PASS

**Step 5: Commit**
Run: `git add . && git commit -m "feat: workspace setup and init PROJECT.md"`


### Task 2: Build Unified SPA Shell Index
**Objective:** Merge the 4 Stitch HTML pages into a single `index.html` file using standard display toggle wrappers (`class="hidden"`) to act as the primary route container.
**Files:**
- Create: `E:/hermes/profiles/coder/workspace/android_iptv_player/index.html`
- Test: `tests/test_spa_structure.py`

**Step 1: Write failing test (RED)**
```python
from bs4 import BeautifulSoup
import os

def test_spa_containers_exist():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/index.html"
    assert os.path.exists(path)
    with open(path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    # Verify all 4 screens are present in the DOM
    assert soup.find(id="splash-screen") is not None
    assert soup.find(id="dashboard-screen") is not None
    assert soup.find(id="search-screen") is not None
    assert soup.find(id="category-screen") is not None
    assert soup.find(id="player-screen") is not None
```

**Step 2: Run test to verify failure**
Run: `pytest tests/test_spa_structure.py`
Expected: FAIL

**Step 3: Write minimal implementation (GREEN)**
Create `index.html`. Combine CSS links, import Tailwind, copy layout wrappers from the 4 folder modules, and wrap them in custom screen ID tags. Add CSS classes to style custom focus states dynamically.

**Step 4: Run test to verify pass**
Run: `pytest tests/test_spa_structure.py`
Expected: PASS

**Step 5: Commit**
Run: `git add index.html && git commit -m "feat: unified SPA screen wrappers inside index.html"`


### Task 3: Implement IPTV Playlist Parser & Storage Loader
**Objective:** Create utility logic to fetch `https://iptv-org.github.io/iptv/index.m3u` (or category lists), parse lines into an array of channel objects, filter for country `in` (India) / language `hin` (Hindi), and cache in localStorage.
**Files:**
- Create: `E:/hermes/profiles/coder/workspace/android_iptv_player/parser.js`
- Test: `tests/test_parser.py`

**Step 1: Write failing test (RED)**
```python
# Create a dummy parsing script to mock javascript execution
import json

def test_m3u_parsing_logic():
    m3u_data = """#EXTM3U
#EXTINF:-1 tvg-id="AajTak.in" group-title="News",Aaj Tak
http://example.com/aajtak.m3u8"""
    # Parse mock logic output
    channels = parse_m3u_mock(m3u_data)
    assert len(channels) == 1
    assert channels[0]["name"] == "Aaj Tak"
    assert channels[0]["url"] == "http://example.com/aajtak.m3u8"
    assert channels[0]["category"] == "News"
```

**Step 2: Run test to verify failure**
Run: `pytest tests/test_parser.py`
Expected: FAIL

**Step 3: Write minimal implementation (GREEN)**
Write `parser.js`. Parse lines splitting on `#EXTINF` tags, fetching title, category/group name, logo metadata, and stream target URLs.

**Step 4: Run test to verify pass**
Run: `pytest tests/test_parser.py`
Expected: PASS

**Step 5: Commit**
Run: `git add parser.js && git commit -m "feat: parse and load IPTV m3u playlist dynamically"`


### Task 4: Implement TV Remote Key Listener & D-pad Router
**Objective:** Add javascript routing logic to catch `keydown` actions and change the active screen. Manage visual focus classes (`outline-primary`, custom Stitch border highlights) for the selected elements on each screen.
**Files:**
- Create: `E:/hermes/profiles/coder/workspace/android_iptv_player/router.js`
- Test: `tests/test_router.py`

**Step 1: Write failing test (RED)**
```python
# Verify key routing structures
import os

def test_router_functions_defined():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/router.js"
    assert os.path.exists(path)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "handleKeyDown" in content
    assert "switchScreen" in content
    assert "focusElement" in content
```

**Step 2: Run test to verify failure**
Run: `pytest tests/test_router.py`
Expected: FAIL

**Step 3: Write minimal implementation (GREEN)**
Write `router.js`. Implement dynamic key mapping, register keyboard events listener, track coordinate values/indices of lists/grids, and toggle css border outlines for focus indicators.

**Step 4: Run test to verify pass**
Run: `pytest tests/test_router.py`
Expected: PASS

**Step 5: Commit**
Run: `git add router.js && git commit -m "feat: add keyboard keydown listeners and focus routing"`


### Task 5: Build HLS Player Engine with EPG Overlay
**Objective:** Hook up `hls.js` to target the `<video>` container in the player view, load selected stream URL, overlay dynamic schedules (EPG metadata), and listen to Back/Escape button to stop stream and return to dashboard.
**Files:**
- Create: `E:/hermes/profiles/coder/workspace/android_iptv_player/player.js`
- Test: `tests/test_player.py`

**Step 1: Write failing test (RED)**
```python
import os
def test_player_script_integrity():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/player.js"
    assert os.path.exists(path)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "initHlsPlayer" in content
    assert "showEpgOverlay" in content
```

**Step 2: Run test to verify failure**
Run: `pytest tests/test_player.py`
Expected: FAIL

**Step 3: Write minimal implementation (GREEN)**
Write `player.js` script with `hls.js` setup. Attach hooks to change channel, fetch stream status, and load details.

**Step 4: Run test to verify pass**
Run: `pytest tests/test_player.py`
Expected: PASS

**Step 5: Commit**
Run: `git add player.js && git commit -m "feat: hls.js video player and overlay logic integration"`


### Task 6: Package WebView Container into Android APK Configuration
**Objective:** Add standard `capacitor.config.json` configuration or write simple Android Studio launcher activity to load `index.html` inside a full-screen local WebView.
**Files:**
- Create: `E:/hermes/profiles/coder/workspace/android_iptv_player/capacitor.config.json`
- Test: `tests/test_android_packaging.py`

**Step 1: Write failing test (RED)**
```python
import os, json

def test_packaging_config_exists():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/capacitor.config.json"
    assert os.path.exists(path)
    with open(path, "r") as f:
        config = json.load(f)
    assert config["appId"] == "com.stitch.customiptv"
```

**Step 2: Run test to verify failure**
Run: `pytest tests/test_android_packaging.py`
Expected: FAIL

**Step 3: Write minimal implementation (GREEN)**
Create `capacitor.config.json` with correct bundle properties. Set web asset path directory mapping.

**Step 4: Run test to verify pass**
Run: `pytest tests/test_android_packaging.py`
Expected: PASS

**Step 5: Commit**
Run: `git add capacitor.config.json && git commit -m "feat: add capacitor pack config for Android webview packaging"`
