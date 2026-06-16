import os, json

def test_packaging_config_exists():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/capacitor.config.json"
    assert os.path.exists(path)
    with open(path, "r") as f:
        config = json.load(f)
    assert config["appId"] == "com.stitch.customiptv"
