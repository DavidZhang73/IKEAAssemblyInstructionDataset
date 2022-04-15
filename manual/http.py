import os
from time import sleep

import requests

def get_response(url, stream=False):
    max_try_count = 5
    try_count = 1
    while try_count <= max_try_count:
        try:
            return requests.get(url, stream=stream)
        except Exception as e:
            print(f'{e}, waiting for retry, {max_try_count - try_count} times remains')
            try_count += 1
            sleep(0.1 * try_count)


def get_html(url):
    return get_response(url).text


def get_json(url):
    return get_response(url).json()


def download_binary(url, output_path, output_name):
    os.makedirs(output_path, exist_ok=True)
    r = get_response(url, stream=True)
    pathname = os.path.abspath(os.path.join(output_path, output_name))
    with open(pathname, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
    return pathname
