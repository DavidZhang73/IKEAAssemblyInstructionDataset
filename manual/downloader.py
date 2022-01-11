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


def split_manual_to_page_list(pathname, output_path):
    os.makedirs(output_path, exist_ok=True)
    cmd = f'pdftoppm -q -png {pathname} {os.path.join(output_path, "page")}'
    os.system(cmd)
    return [
        {
            "pathname": os.path.abspath(os.path.join(output_path, file))
        }
        for file in os.listdir(output_path)
    ]


def get_manual(item, output_path):
    for i, manual in enumerate(item['manualList']):
        url = manual['url']
        if url:
            pathname = download_binary(
                url,
                os.path.join(output_path, 'manual'),
                _get_output_name(url)
            )
            item['manualList'][i]['pathname'] = pathname
            item['manualList'][i]['pageList'] = split_manual_to_page_list(
                pathname,
                os.path.join(output_path, 'manual', str(i + 1))
            )

    database.get_collection('item').update_one({'_id': item['_id']}, {'$set': item})


def get_item(item):
    output_path = get_output_path(item)
    get_image(item, output_path)
    get_manual(item, output_path)


if __name__ == '__main__':
    thread_map(get_item, list(database.get_collection('item').find()), max_workers=4)
