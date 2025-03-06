#!/bin/bash

echo "Waiting for MongoDB to start..."
sleep 10  # Wait to ensure MongoDB is up

echo "Initializing MongoDB replica set..."
mongo --eval 'rs.initiate()'  # Initialize the replica set

# Optional: Wait until the replica set is ready
sleep 5

echo "Running initial database queries..."
python3 /app/mongo_queries.py  # Run your MongoDB queries

echo "Starting Flask backend..."
python3 /app/main.py  # Start the backend
