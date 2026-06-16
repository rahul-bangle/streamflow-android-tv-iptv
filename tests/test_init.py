import os

def test_workspace_files_exist():
    base_dir = "E:/hermes/profiles/coder/workspace/android_iptv_player"
    assert os.path.exists(os.path.join(base_dir, "PROJECT.md"))
    assert os.path.exists(os.path.join(base_dir, "cinematic_immersive/DESIGN.md"))
