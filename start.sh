#!/bin/bash

cross-env \
  PRIVATE_KEY=d5b86f5cdeea55f6f3ac46c42aa23e175773a2bc124b32c99878c13f33959dc2 \
  FROM_ADDRESS=0xb2b0f2baff7ddf8a80c47e81b3d37d4f6b5bf944 \
  DISTRIBUTION_ADDRESS=0x64b8f33eb65b32eeedae05897242e05201a702f8 \
  TOKEN_ADDRESS=0x1e43d5fb884ce58e332cb6ad8b21f16a4a0f135b \
  WEB3=http://127.0.0.1:8545 \
  DEBUG=*,-ACE:VERB \
    babel-node app.js