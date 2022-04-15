from yt_dlp import YoutubeDL

ydl_opts = {'format': 'bestaudio'}
with YoutubeDL(ydl_opts) as ydl:
    ydl.download(['https://www.youtube.com/watch?v=BaW_jenozKc'])
