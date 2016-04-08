#!/bin/bash

curl -H 'Content-Type: application/json' -XPOST https://status.storj.io/ -d '{
  "method": "REPORT",
  "id": 1234567,
  "params": {
    "store": {
      "free": 1000,
      "used": 100
    },
    "bandwidth": {
      "upload": 10.5,
      "download": 100.8
    },
    "contact": {
      "protocol": "superawesomeprotol",
      "nodeID": "12D900BC92350EC",
      "address": "127.0.0.1",
      "port": 1234
    },
    "timestamp": 1459529861,
    "payment": "jlk3j4k2j34lkjk2l3k4j23gh423lk4",
    "signature": "thisismysigpleasevalidateitnow"
  }
}'
