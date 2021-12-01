import os

from util.http import get_response


def download(url, output_path, output_name):
    os.makedirs(output_path, exist_ok=True)
    r = get_response(url, stream=True)
    with open(os.path.join(output_path, output_name), 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)


if __name__ == '__main__':
    pass
