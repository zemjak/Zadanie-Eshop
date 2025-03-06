import datetime
import json
import logging
import os
from http import HTTPStatus

from bson.objectid import ObjectId
from dotenv import load_dotenv
from flasgger import Swagger
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from pymongo import ASCENDING, DESCENDING, MongoClient, errors

logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
app.config.from_mapping(SECRET_KEY=os.getenv("SECRET_KEY", "dev"))
CORS(app)

with open("openapi.json") as f:
    openapi_spec = json.load(f)

swagger = Swagger(app, template=openapi_spec)

dbClient = MongoClient(os.getenv("DATABASE_URL"))
db = dbClient[os.getenv("DATABASE_NAME")]


@app.errorhandler(405)
def handle_405(error):
    return jsonify({"error": "Method not allowed"}), HTTPStatus.METHOD_NOT_ALLOWED


@app.errorhandler(404)
def handle_404(error):
    return jsonify({"error": "Page not found"}), HTTPStatus.NOT_FOUND


@app.errorhandler(500)
def handle_500(error):
    return jsonify({"error": "Internal Server Error"}), HTTPStatus.INTERNAL_SERVER_ERROR


@app.route("/")
def index():
    return jsonify({"data": "Welcome in Bart Eshop API!"}), HTTPStatus.OK


# Vytvorenie novej objednávky, ktorá bude obsahovať email, id produktu, počet objednaných kusov
@app.route("/orders", methods=["POST"])
def create_order():
    try:
        request_json = request.get_json()
        if not request_json:
            return jsonify({"error": "Missing JSON body."}), HTTPStatus.BAD_REQUEST
        if "email" not in request_json:
            return (
                jsonify({"error": "Missing required field - email"}),
                HTTPStatus.BAD_REQUEST,
            )
        if "products" not in request_json:
            return (
                jsonify({"error": "Missing required field - products"}),
                HTTPStatus.BAD_REQUEST,
            )

        email = request_json["email"]
        products = request_json["products"]

        if not isinstance(products, list):
            return (
                jsonify({"error": "products must be an array"}),
                HTTPStatus.BAD_REQUEST,
            )
        if len(products) == 0:
            return (
                jsonify({"error": "products array can not be empty"}),
                HTTPStatus.BAD_REQUEST,
            )

        new_order = {
            "email": email,
            "status": "unpaid",
            "products": [],
        }

        # start of transaction
        with dbClient.start_session() as session:
            session.start_transaction()
            for product in products:
                # product structure validation
                if (
                    not isinstance(product, dict)
                    or "id" not in product
                    or "quantity" not in product
                ):
                    return (
                        jsonify(
                            {
                                "error": "Each product must be an object with 'id' and 'quantity'"
                            }
                        ),
                        HTTPStatus.BAD_REQUEST,
                    )
                if not isinstance(product["id"], str) or not ObjectId.is_valid(
                    product["id"]
                ):
                    return (
                        jsonify({"error": "product's id must be hex string"}),
                        HTTPStatus.BAD_REQUEST,
                    )
                if not isinstance(product["quantity"], int) or product["quantity"] < 1:
                    return (
                        jsonify(
                            {"error": "product's quantity must be positive number"}
                        ),
                        HTTPStatus.BAD_REQUEST,
                    )

                # validation of stock quantity
                fetched_product = db["products"].find_one(
                    {"_id": ObjectId(product["id"])}, session=session
                )
                if not fetched_product:
                    raise ValueError("product with given id does not exist")
                if fetched_product["stock"] < product["quantity"]:
                    raise ValueError(
                        "required number of products is currently not in stock"
                    )

                # remove from stock
                db["products"].update_one(
                    {"_id": ObjectId(product["id"])},
                    {
                        "$inc": {
                            "stock": -product["quantity"],
                            "units_sold": product["quantity"],
                        }
                    },
                    session=session,
                )
                # add to order
                new_order["products"].append(
                    {
                        "_id": ObjectId(product["id"]),
                        "name": fetched_product["name"],
                        "price": fetched_product["price"],
                        "quantity": product["quantity"],
                    }
                )

            new_order["total_price"] = sum(
                product["price"] * product["quantity"]
                for product in new_order["products"]
            )
            new_order["created_at"] = datetime.datetime.now(
                datetime.timezone.utc
            ).isoformat()
            db["orders"].insert_one(new_order, session=session)
            session.commit_transaction()
        # end of transaction

        return Response(status=HTTPStatus.CREATED)

    except Exception as exception:
        logger.error(str(exception))
        if isinstance(exception, ValueError):
            return jsonify({"error": str(exception)}), HTTPStatus.BAD_REQUEST
        if isinstance(exception,  errors.WriteError):
            return jsonify({"error": "Wrong email format."}), HTTPStatus.BAD_REQUEST
        else:
            return (
                jsonify({"error": "Internal Server Error."}),
                HTTPStatus.INTERNAL_SERVER_ERROR,
            )


# Získanie zoznamu vytvorených objednávok
@app.route("/orders", methods=["GET"])
def get_orders():
    try:
        page = request.args.get("page", default=1, type=int)
        if page <= 0:
            return (
                jsonify({"error": "page number can not be negative"}),
                HTTPStatus.BAD_REQUEST,
            )
        limit = request.args.get("limit", default=20, type=int)
        if limit <= 0:
            return (
                jsonify({"error": "limit can not be negative"}),
                HTTPStatus.BAD_REQUEST,
            )
        if limit > 50:
            return (
                jsonify({"error": "limit can not be greater than 50"}),
                HTTPStatus.BAD_REQUEST,
            )
        filter_email = request.args.get("filter_email", default="", type=str).strip()
        filter_status = request.args.get("filter_status", default="", type=str).strip()
        allowed_statuses = ("", "unpaid", "cancelled")
        if filter_status not in allowed_statuses:
            return (
                jsonify({"error": "unknown filter for status"}),
                HTTPStatus.BAD_REQUEST,
            )
        skip = (page - 1) * limit

        query = {} if not filter_status else {"status": filter_status}
        if filter_email:
            query["email"] = filter_email
        orders_cursor = (
            db["orders"]
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort("created_at", DESCENDING)
            .collation({"locale": "sk", "strength": 1})
        )
        orders = list(orders_cursor)

        for order in orders:
            order["_id"] = str(order["_id"])
            for idx, product in enumerate(order["products"]):
                order["products"][idx]["_id"] = str(product["_id"])

        total_orders = db["orders"].count_documents(query)

        response = {
            "data": {
                "page": page,
                "limit": limit,
                "total_orders": total_orders,
                "total_pages": (total_orders + limit - 1) // limit,
                "orders": orders,
            }
        }
        return jsonify(response), HTTPStatus.OK

    except Exception as exception:
        logger.error(str(exception))
        return (
            jsonify({"error": "Internal Server Error."}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


# Zmazanie objednávky podľa id
@app.route("/orders/<order_id>", methods=["DELETE"])
def cancel_order(order_id):
    if not ObjectId.is_valid(order_id):
        return jsonify({"error": "Invalid order ID"}), HTTPStatus.BAD_REQUEST

    order = db["orders"].find_one({"_id": ObjectId(order_id)})
    if not order:
        return jsonify({"error": "Order with given id not found"}), HTTPStatus.NOT_FOUND
    if order["status"] == "cancelled":
        return jsonify({"error": "Order is already cancelled."}), HTTPStatus.BAD_REQUEST
    if order["status"] != "unpaid":
        return (
            jsonify({"error": "Can not cancel order in this state."}),
            HTTPStatus.BAD_REQUEST,
        )

    # start of transaction
    with dbClient.start_session() as session:
        session.start_transaction()
        # return products from the order to the stock
        for product in order["products"]:
            db["products"].update_one(
                {"_id": ObjectId(product["_id"])},
                {
                    "$inc": {
                        "stock": product["quantity"],
                        "units_sold": -product["quantity"],
                    }
                },
                session=session,
            )

        # cancel order
        db["orders"].update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": "cancelled"}},
            session=session,
        )

        session.commit_transaction()
    # end of transaction

    return Response(status=HTTPStatus.NO_CONTENT)


# Získanie zoznamu produktov v tvare id, názov, počet kusov na sklade
@app.route("/products", methods=["GET"])
def get_products():
    try:
        page = request.args.get("page", default=1, type=int)
        if page <= 0:
            return (
                jsonify({"error": "page number can not be negative"}),
                HTTPStatus.BAD_REQUEST,
            )
        limit = request.args.get("limit", default=20, type=int)
        if limit <= 0:
            return (
                jsonify({"error": "limit can not be negative"}),
                HTTPStatus.BAD_REQUEST,
            )
        if limit > 50:
            return (
                jsonify({"error": "limit can not be greater than 50"}),
                HTTPStatus.BAD_REQUEST,
            )
        name_query = request.args.get("name_query", default="", type=str).strip()
        order_by = request.args.get("order_by", default="name", type=str).strip()
        allowed_orders_by = ("name", "_id", "stock", "price", "units_sold")
        if order_by not in allowed_orders_by:
            return jsonify({"error": "unknown order_by"}), HTTPStatus.BAD_REQUEST
        order = request.args.get("order", default="asc", type=str).strip()
        allowed_orders = ("asc", "desc")
        if order not in allowed_orders:
            return jsonify({"error": "unknown order"}), HTTPStatus.BAD_REQUEST
        skip = (page - 1) * limit

        query = (
            {} if not name_query else {"name": {"$regex": name_query, "$options": "i"}}
        )
        projection = {"units_sold": 0}
        products_cursor = (
            db["products"]
            .find(query, projection)
            .skip(skip)
            .limit(limit)
            .sort(order_by, ASCENDING if order == "asc" else DESCENDING)
            .collation({"locale": "sk", "strength": 1})
        )
        products = list(products_cursor)

        for product in products:
            product["_id"] = str(product["_id"])

        total_products = db["products"].count_documents(query)

        response = {
            "data": {
                "page": page,
                "limit": limit,
                "total_products": total_products,
                "total_pages": (total_products + limit - 1) // limit,
                "products": products,
            }
        }
        return jsonify(response), HTTPStatus.OK

    except Exception as exception:
        logger.error(str(exception))
        return (
            jsonify({"error": "Internal Server Error."}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


if __name__ == "__main__":
    app.run()
