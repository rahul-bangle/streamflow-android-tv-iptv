import os

def test_player_script_integrity():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/player.js"
    assert os.path.exists(path)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "startHlsPlayer" in content
    assert "stopHlsPlayer" in content
