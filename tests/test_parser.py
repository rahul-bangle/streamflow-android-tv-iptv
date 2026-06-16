import json
import pytest

# Mocking Javascript m3u parsing logic inside Python to verify regex matching
def parse_m3u_mock(content):
    channels = []
    lines = content.strip().split('\n')
    current_channel = {}
    
    for line in lines:
        line = line.strip()
        if line.startswith('#EXTINF:'):
            # Parse parameters
            current_channel = {}
            # Logo parse
            logo_idx = line.find('tvg-logo="')
            if logo_idx != -1:
                start = logo_idx + len('tvg-logo="')
                end = line.find('"', start)
                current_channel['logo'] = line[start:end]
            else:
                current_channel['logo'] = ""
                
            # Category parse
            cat_idx = line.find('group-title="')
            if cat_idx != -1:
                start = cat_idx + len('group-title="')
                end = line.find('"', start)
                current_channel['category'] = line[start:end]
            else:
                current_channel['category'] = "General"
                
            # Name parse (comma delimited)
            comma_idx = line.rfind(',')
            if comma_idx != -1:
                current_channel['name'] = line[comma_idx+1:].strip()
            else:
                current_channel['name'] = "Unknown Channel"
        elif line.startswith('http'):
            if current_channel:
                current_channel['url'] = line
                channels.append(current_channel)
                current_channel = {}
    return channels

def test_m3u_parsing_logic():
    m3u_data = """#EXTM3U
#EXTINF:-1 tvg-id="AajTak.in" group-title="News" tvg-logo="https://example.com/logo.png",Aaj Tak
http://example.com/aajtak.m3u8"""
    channels = parse_m3u_mock(m3u_data)
    assert len(channels) == 1
    assert channels[0]["name"] == "Aaj Tak"
    assert channels[0]["url"] == "http://example.com/aajtak.m3u8"
    assert channels[0]["category"] == "News"
    assert channels[0]["logo"] == "https://example.com/logo.png"
