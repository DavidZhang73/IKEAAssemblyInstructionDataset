from time import sleep

import requests

from config import PROXIES


def get_response(url, stream=False):
    max_try_count = 5
    try_count = 1
    while try_count <= max_try_count:
        try:
            return requests.get(url, proxies=PROXIES, stream=stream)
        except Exception as e:
            print(f'{e}, 等待重试，还剩 {max_try_count - try_count} 次。')
            try_count += 1
            sleep(0.1 * try_count)


def get_html(url):
    return get_response(url).text


def get_json(url):
    return get_response(url).json()
