# API backend - Python Flask

### Create virtual environment
```shell
python3 -m venv venv
```

### Install dependencies
```shell
source venv/bin/activate
pip install -r requirements.txt
```

### Linting & code reformatting 
```shell
python3 isort main.py mongo_queries.py
python3 black main.py mongo_queries.py
python3 flake8 main.py mongo_queries.py
```

### Initialize DB
```shell
python3 mongo_queries.py
```

### Run server
```shell
python3 main.py
```

### Server available at
```
http://127.0.0.1:5000
```

### Swagger documentation available at
```
http://127.0.0.1:5000/apidocs/
```