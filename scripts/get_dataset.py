import json
import os
from time import sleep

import fitz
import requests
import youtube_dl
from PIL import Image
from tqdm.contrib.concurrent import thread_map

USE_CACHE = True

DATASET_PATH = os.path.join('..', 'dataset')
DATASET_JSON_NAME = 'IkeaAssemblyInstructionDataset.json'
DATASET_JSON_PATHNAME = os.path.join(DATASET_PATH, DATASET_JSON_NAME)

YOUTUBE_DL_OPTION = {
    # 'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    'format': 'worst[ext=mp4]+worst[ext=m4a]/worst[ext=mp4]/worst',
    'quiet': True,
    'restrictfilenames': True
}


def _get_response(url, stream=False):
    max_try_count = 5
    try_count = 1
    while try_count <= max_try_count:
        try:
            return requests.get(url, stream=stream)
        except Exception as e:
            print(f'{e}, waiting for retry, {max_try_count - try_count} times remains')
            try_count += 1
            sleep(0.1 * try_count)


def _get_html(url):
    return _get_response(url).text


def _get_json(url):
    return _get_response(url).json()


def _get_binary(url, output_path, output_name):
    os.makedirs(output_path, exist_ok=True)
    r = _get_response(url, stream=True)
    output_pathname = os.path.abspath(os.path.join(output_path, output_name))
    if os.path.exists(output_pathname) and USE_CACHE:
        return output_pathname
    output_pathname_part = output_pathname + '.part'
    with open(output_pathname_part, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
    os.rename(output_pathname_part, output_pathname)
    return output_pathname


def _get_video(url, output_path):
    os.makedirs(output_path, exist_ok=True)
    ydl_opt = YOUTUBE_DL_OPTION
    ydl_opt['outtmpl'] = os.path.join(os.path.abspath(output_path), '%(id)s.%(ext)s')
    with youtube_dl.YoutubeDL(ydl_opt) as ydl:
        ydl_info = ydl.extract_info(url)
        output_pathname = os.path.join(os.path.abspath(output_path), f"{ydl_info['id']}.{ydl_info['ext']}")
        if os.path.exists(output_pathname) and USE_CACHE:
            return output_pathname
        ydl.download([url])
    return output_pathname


def _get_output_name(url):
    return url.split('/')[-1]


def _get_output_path(item):
    return os.path.join(DATASET_PATH, item['category'], item['subCategory'], item['id'])


def get_image(item, output_path):
    url = item['mainImageUrl']
    if url:
        item['mainImagePathname'] = _get_binary(url, output_path, _get_output_name(url))


def get_manual(item, output_path):
    manual_pix_list = []
    for i, manual in enumerate(item['manualList']):
        url = manual['url']
        if url:
            pathname = _get_binary(
                url,
                os.path.join(output_path, 'manual'),
                _get_output_name(url)
            )
            item['manualList'][i]['pathname'] = pathname
            # pageList
            page_list = []
            page_output_path = os.path.join(output_path, 'manual', str(i + 1))
            os.makedirs(page_output_path, exist_ok=True)
            with fitz.open(pathname) as doc:
                pix_list = []
                for index, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=150)
                    pix_list.append(pix)
                    output_pathname = os.path.join(os.path.abspath(page_output_path), f'page-{index + 1}.png')
                    pix.save(output_pathname)
                    page_list.append({
                        "pathname": output_pathname
                    })
                item['manualList'][i]['pageList'] = page_list
                manual_pix_list.append(pix_list)
    # stepList
    step_list = []
    step_output_path = os.path.join(output_path, 'step')
    os.makedirs(step_output_path, exist_ok=True)
    for index, step in enumerate(item['annotationList']):
        step_pix = manual_pix_list[step['manual']][step['page']]
        img = Image.frombytes("RGB", (step_pix.width, step_pix.height), step_pix.samples)
        left = max(0, step['x'])
        top = max(0, step['y'])
        right = min(step['x'] + step['width'], step_pix.width)
        bottom = min(step['y'] + step['height'], step_pix.height)
        img = img.crop((left, top, right, bottom))
        output_pathname = os.path.join(os.path.abspath(step_output_path), f'step-{index + 1}.png')
        img.save(output_pathname)
    item['stepList'] = step_list


def get_video(item, output_path):
    for i, video in enumerate(item['videoList']):
        url = video['url']
        if url:
            pathname = _get_video(
                url,
                os.path.join(output_path, 'video')
            )
            item['videoList'][i]['pathname'] = pathname


def get_item(item):
    output_path = _get_output_path(item)
    get_image(item, output_path)
    get_manual(item, output_path)
    get_video(item, output_path)


if __name__ == '__main__':
    with open(DATASET_JSON_PATHNAME, 'r', encoding='utf8') as f:
        item_list = json.load(f)
    thread_map(get_item, item_list)
