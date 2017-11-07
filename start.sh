#!/bin/bash

cross-env \
  PRIVATE_KEY=d5b86f5cdeea55f6f3ac46c42aa23e175773a2bc124b32c99878c13f33959dc2 \
  FROM_ADDRESS=0xb2b0f2baff7ddf8a80c47e81b3d37d4f6b5bf944 \
  DISTRIBUTION_ADDRESS=0x64b8f33eb65b32eeedae05897242e05201a702f8 \
  TOKEN_ADDRESS=0x06147110022B768BA8F99A8f385df11a151A9cc8 \
  WEB3=http://pub-node1.etherscan.io:8545 \
  API_DOMAIN=https://acetoken.tokenstars.com/api \
  DEBUG=ACE:ERROR,ACE:INFO,ACE:WARNING \
    babel-node app.js $@