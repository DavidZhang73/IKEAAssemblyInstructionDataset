import os

from tqdm.contrib.concurrent import thread_map

from config import DATA_PATH
from util.database import database
from util.http import download_binary


def _get_output_name(url):
    return url.split('/')[-1]


def get_output_path(item):
    return os.path.join(DATA_PATH, item['category'], item['subCategory'], item['id'])


def get_image(item, output_path):
    url = item['mainImageUrl']
    if url:
        item['mainImagePathname'] = download_binary(url, output_path, _get_output_name(url))
    database.get_collection('item').update_one({'_id': item['_id']}, {'$set': item})


def get_manual(item, output_path):
    for i, manual in enumerate(item['manualList']):
        url = manual['url']
        if url:
            item['manualList'][i]['pathname'] = download_binary(
                url,
                os.path.join(output_path, 'manual'),
                _get_output_name(url)
            )

    database.get_collection('item').update_one({'_id': item['_id']}, {'$set': item})


def get_item(item):
    output_path = get_output_path(item)
    get_image(item, output_path)
    get_manual(item, output_path)


if __name__ == '__main__':
    thread_map(get_item, list(database.get_collection('item').find()))
