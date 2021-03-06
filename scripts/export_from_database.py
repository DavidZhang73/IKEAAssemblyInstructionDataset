import json
import os

from manual.database import database

OUTPUT_PATH = '../dataset'
OUTPUT_NAME = 'IkeaAssemblyInstructionRawDataset.json'
OUTPUT_PATHNAME = os.path.join(OUTPUT_PATH, OUTPUT_NAME)

ITEM_KEYS_TO_SAVE = ['id', 'name', 'category', 'subCategory', 'typeName', 'pipUrl', 'mainImageUrl', 'variants',
                      'manualList', 'annotationList', 'videoList']
MANUAL_KEYS_TO_SAVE = ['url']
ANNOTATION_KEYS_TO_SAVE = ['manual', 'page', 'step', 'x', 'y', 'width', 'height', 'color']
VIDEO_KEYS_TO_SAVE = ['url']
VIDEO_ANNOTATION_KEYS_TO_SAVE = ['manual', 'page', 'step', 'start', 'end', 'description']
os.makedirs(OUTPUT_PATH, exist_ok=True)


def save_to_json_file(obj, output_pathname):
    with open(output_pathname, 'w', encoding='utf8') as f:
        json.dump(obj, f)


def _copy_dict_by_keys(obj, keys_to_save):
    ret = {}
    for key in keys_to_save:
        if key not in obj:
            raise RuntimeError(f"There is no {key} in item {obj}")
        ret[key] = obj[key]
    return ret


def get_item_list(raw_item_list):
    ret = []
    for item in raw_item_list:
        if 'progressStatus' in item \
                and item['progressStatus'] \
                and item['progressStatus'][0] \
                and item['progressStatus'][1]:
            manual_map = {}
            if 'manualList' in item \
                    and 'manualList' in ITEM_KEYS_TO_SAVE \
                    and MANUAL_KEYS_TO_SAVE:
                for i in range(len(item['manualList'])):
                    manual_map[i] = _copy_dict_by_keys(item['manualList'][i], MANUAL_KEYS_TO_SAVE)
            manual_id_set = set()
            if 'annotationList' in item \
                    and 'annotationList' in ITEM_KEYS_TO_SAVE \
                    and ANNOTATION_KEYS_TO_SAVE:
                for i in range(len(item['annotationList'])):
                    manual_id_set.add(item['annotationList'][i]['manual'])
                for i in range(len(item['manualList'])):
                    if i not in manual_id_set:
                        del manual_map[i]
                new_manual_list = list(manual_map.values())
                item['manualList'] = new_manual_list
                manual_id_map = {}
                for key, value in manual_map.items():
                    for i in range(len(new_manual_list)):
                        if new_manual_list[i]['url'] == value['url']:
                            manual_id_map[key] = i
                            break
                for i in range(len(item['annotationList'])):
                    new_annotation = _copy_dict_by_keys(item['annotationList'][i], ANNOTATION_KEYS_TO_SAVE)
                    new_annotation['manual'] = manual_id_map[new_annotation['manual']]
                    item['annotationList'][i] = new_annotation
            if 'videoList' in item \
                    and 'videoList' in ITEM_KEYS_TO_SAVE \
                    and VIDEO_KEYS_TO_SAVE:
                for i in range(len(item['videoList'])):
                    item['videoList'][i] = _copy_dict_by_keys(item['videoList'][i], VIDEO_KEYS_TO_SAVE)
                    if 'annotationList' in item['videoList'][i] \
                            and 'annotationList' in VIDEO_KEYS_TO_SAVE \
                            and VIDEO_ANNOTATION_KEYS_TO_SAVE:
                        for j in range(len(item['videoList'][i]['annotationList'])):
                            item['videoList'][i]['annotationList'][j] = _copy_dict_by_keys(
                                item['videoList'][i]['annotationList'][j], VIDEO_ANNOTATION_KEYS_TO_SAVE)
            ret.append(_copy_dict_by_keys(item, ITEM_KEYS_TO_SAVE))
    return ret


if __name__ == '__main__':
    item_list = get_item_list(database.get_collection('item').find())
    print(f"{len(item_list)} items")
    print(f"{sum([len(item['videoList']) for item in item_list])} videos")
    save_to_json_file(item_list, OUTPUT_PATHNAME)
