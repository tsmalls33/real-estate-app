#!/bin/bash
set -e

docker-compose -f db/test_db.yml up -d
