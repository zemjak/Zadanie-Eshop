import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
dbClient = MongoClient(os.getenv("DATABASE_URL"))
db = dbClient[os.getenv("DATABASE_NAME")]

if __name__ == "__main__":
    db.create_collection(
        "products",
        validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["_id", "name", "price", "stock", "units_sold"],
                "properties": {
                    "_id": {"bsonType": "objectId"},
                    "name": {
                        "bsonType": "string",
                        "description": "Name must be a string and is required",
                    },
                    "price": {
                        "bsonType": "double",
                        "minimum": 0.0,
                        "description": "Price can not be negative",
                    },
                    "stock": {
                        "bsonType": "int",
                        "minimum": 0,
                        "description": "number of pieces in stock, can not be negative",
                    },
                    "units_sold": {
                        "bsonType": "int",
                        "minimum": 0,
                        "description": "number of pieces sold or on active orders, can not be negative",
                    },
                },
                "additionalProperties": False,
            }
        },
    )

    db.create_collection(
        "orders",
        validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "_id",
                    "email",
                    "created_at",
                    "products",
                    "status",
                    "total_price",
                ],
                "properties": {
                    "_id": {"bsonType": "objectId"},
                    "email": {
                        "bsonType": "string",
                        "pattern": "^.+@.+\..+$",
                        "description": "Email must be a valid email address",
                    },
                    "created_at": {
                        "bsonType": "string",
                        "description": "ISO 8601 UTC time of creation of order",
                    },
                    "products": {
                        "bsonType": "array",
                        "description": "Must be an array of products.",
                        "items": {
                            "bsonType": "object",
                            "required": ["_id", "name", "price", "quantity"],
                            "properties": {
                                "_id": {"bsonType": "objectId"},
                                "name": {
                                    "bsonType": "string",
                                    "description": "Product name must be a string.",
                                },
                                "price": {
                                    "bsonType": "double",
                                    "minimum": 0,
                                    "description": "Price must be a positive number.",
                                },
                                "quantity": {
                                    "bsonType": "int",
                                    "minimum": 1,
                                    "description": "Quantity must be a positive integer.",
                                },
                            },
                            "additionalProperties": False,
                        },
                    },
                    "status": {
                        "enum": ["unpaid", "cancelled"],
                        "description": "ISO 8601 UTC time of creation of order",
                    },
                    "total_price": {
                        "bsonType": "double",
                        "minimum": 0.0,
                        "description": "can not be negative",
                    },
                },
                "additionalProperties": False,
            }
        },
    )

    print("Collections created with validation schema.")

    do_I_want_to_insert_data = True
    if do_I_want_to_insert_data:
        db["products"].insert_many(
            [
                {"name": "Nohavice", "stock": 7, "price": 22.51, "units_sold": 1},
                {"name": "Tričko", "stock": 10, "price": 4.32, "units_sold": 9},
                {"name": "Mikina", "stock": 3, "price": 16.69, "units_sold": 2},
                {"name": "Čiapka", "stock": 5, "price": 5.02, "units_sold": 1},
            ]
        )
        print("Data inserted.")
