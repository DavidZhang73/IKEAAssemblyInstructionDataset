import bs4
from bs4 import BeautifulSoup
from tqdm import tqdm

from util.database import database
from util.http import get_html, get_json


def get_category_list():
    category_list = []

    html = get_html('https://www.ikea.com/au/en/cat/products-products/')

    soup = BeautifulSoup(html, 'html.parser')
    nav_soup = soup.find('nav', class_='vn-nav vn-p-grid vn-accordion')
    for category_soup in nav_soup.children:
        if type(category_soup) is bs4.element.Tag:
            category_name = category_soup.find_all(
                'span',
                class_='vn-accordion__title h4'
            )[0].get_text()
            sub_category_list_soup = category_soup.find_all(
                'ul',
                class_='vn-list--plain vn-list vn-accordion__content'
            )[0]
            sub_category_list = []
            for sub_category_soup in sub_category_list_soup.find_all('a', href=True):
                if type(sub_category_soup) is bs4.element.Tag:
                    sub_category_name = sub_category_soup.get_text()
                    url = sub_category_soup['href']
                    sub_category_list.append({
                        'name': sub_category_name,
                        'url': url,
                    })
            category_list.append({
                'name': category_name,
                'subCategoryList': sub_category_list
            })
    return category_list


def save_category_list(category_list):
    database.get_collection('category').insert_many(category_list)


def _get_item_list_from_result_list(result_list, category, sub_category):
    _item_list = []
    for item in result_list:
        _item_list.append({
            'id': item['id'],
            'category': category,
            'subCategory': sub_category,
            'name': item['name'],
            'typeName': item['typeName'],
            'mainImageUrl': item.get('mainImageUrl', ''),
            'pipUrl': item['pipUrl'],
            'variants': list(map(lambda x: x['id'], item['gprDescription']['variants']))
        })
    return _item_list


def get_item_list_from_sub_category(category, sub_category):
    _item_list = []

    sub_category_id = sub_category['url'].split('/')[-2].split('-')[-1]
    result = get_json(f'https://sik.search.blue.cdtapps.com/au/en/product-list-page?category={sub_category_id}')
    count = result['productListPage']['productCount']
    _item_list.extend(
        _get_item_list_from_result_list(result['productListPage']['productWindow'], category, sub_category))
    current_index = 24
    while current_index + 24 < count:
        result = get_json(f'https://sik.search.blue.cdtapps.com/au/en/product-list-page/more-products'
                          f'?category={sub_category_id}'
                          f'&start={current_index}'
                          f'&end={current_index + 24}')
        current_index += 24
        _item_list.extend(
            _get_item_list_from_result_list(result['moreProducts']['productWindow'], category, sub_category))
    if current_index <= count:
        result = get_json(f'https://sik.search.blue.cdtapps.com/au/en/product-list-page/more-products'
                          f'?category={sub_category_id}'
                          f'&start={current_index}'
                          f'&end={count}')
        _item_list.extend(
            _get_item_list_from_result_list(result['moreProducts']['productWindow'], category, sub_category))

    return _item_list


def get_item_list_from_category(category):
    _item_list = []
    category_bar = tqdm(category['subCategoryList'])
    for sub_category in category_bar:
        if sub_category['name'] == 'Shop all':
            continue
        category_bar.set_description(f"Obtaining category: {category['name']} - {sub_category['name']}")
        _item_list.extend(get_item_list_from_sub_category(category, sub_category))
    return _item_list


def _get_manual_list(item):
    pip_url = item['pipUrl']
    manual_list = []
    html = get_html(pip_url)
    soup = BeautifulSoup(html, 'html.parser')
    instruction_list_soup = soup.find_all('div', class_='range-revamp-product-details__container')[-2]
    for instruction in instruction_list_soup.find_all('a', href=True):
        manual_list.append({'url': instruction['href']})
    return manual_list


def save_item(item):
    item['manualList'] = _get_manual_list(item)
    item['category'] = item['category']['name']
    item['subCategory'] = item['subCategory']['name']
    database.get_collection('item').insert_one(item)


if __name__ == '__main__':
    # Step 1
    # save_category_list(get_category_list())
    # Step 2
    # item_list = get_item_list_from_category(
    #     database.get_collection('category').find_one(filter={"name": 'Furniture'})
    # )
    # Step 3
    # thread_map(save_item, item_list)
    pass
