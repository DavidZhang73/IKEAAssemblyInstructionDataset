from pymongo import MongoClient

from .config import MONGO_DB_CONNECTION, MONGO_DB_DATABASE


class Database:
    def __init__(self):
        self.client = MongoClient(MONGO_DB_CONNECTION)
        self.database = self.client[MONGO_DB_DATABASE]

    def get_client(self):
        return self.client

    def get_database(self):
        return self.database

    def get_collection(self, collection):
        return self.database[collection]


if __name__ == '__main__':
    database = Database()
else:
    database = Database()
