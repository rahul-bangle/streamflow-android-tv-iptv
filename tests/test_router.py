import os

def test_router_functions_defined():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/router.js"
    assert os.path.exists(path)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "handleKeyDown" in content
    assert "switchScreen" in content
    assert "focusElement" in content
