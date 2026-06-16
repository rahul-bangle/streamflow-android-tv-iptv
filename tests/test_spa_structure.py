from bs4 import BeautifulSoup
import os

def test_spa_containers_exist():
    path = "E:/hermes/profiles/coder/workspace/android_iptv_player/index.html"
    assert os.path.exists(path)
    with open(path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    assert soup.find(id="splash-screen") is not None
    assert soup.find(id="dashboard-screen") is not None
    assert soup.find(id="search-screen") is not None
    assert soup.find(id="category-screen") is not None
    assert soup.find(id="player-screen") is not None
