import json
import os.path

from tqdm.contrib.concurrent import thread_map
import yt_dlp

INPUT_DATASET_PATHNAME = '../dataset/IkeaAssemblyInstructionRawDataset.json'
OUTPUT_DATASET_PATHNAME = '../dataset/IkeaAssemblyInstructionDataset.json'

KEY_LIST = [
    'title',
    'duration',
    'height',
    'width',
    "fps"
]


def get_video_info(video):
    try:
        with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
            info = ydl.extract_info(video['url'], download=False)
            info = ydl.sanitize_info(info)
            for key in KEY_LIST:
                video[key] = info[key]
    except Exception as e:
        print(e)


if __name__ == '__main__':
    use_cache = False
    cache_dataset = None
    if os.path.exists(OUTPUT_DATASET_PATHNAME):
        use_cache = True
        with open(OUTPUT_DATASET_PATHNAME, 'r') as f:
            cache_dataset = json.load(f)

    with open(INPUT_DATASET_PATHNAME, "r") as f:
        dataset = json.load(f)

    video_list = []
    for i in range(len(dataset)):
        item = dataset[i]
        for j in range(len(item['videoList'])):
            video = item['videoList'][j]
            if use_cache \
                    and i < len(cache_dataset) \
                    and j < len(cache_dataset[i]['videoList']) \
                    and video['url'] == cache_dataset[i]['videoList'][j]['url'] \
                    and all(key in cache_dataset[i]['videoList'][j].keys() for key in KEY_LIST):
                video.update(cache_dataset[i]['videoList'][j])
            else:
                video_list.append(video)

    thread_map(get_video_info, video_list)

    with open(OUTPUT_DATASET_PATHNAME, 'w', encoding='utf8') as f:
        json.dump(dataset, f)
