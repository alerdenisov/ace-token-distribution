# Token Distribution Server

### Configure
Edit `./start.bat` or create same for your operation system

### Start.bat structure
```
call cross-env ^
  PRIVATE_KEY= ^# Private key of personal address
  FROM_ADDRESS= ^# Personal address of distribution contract owner
  DISTRIBUTION_ADDRESS= ^# Distribution contract address in blockchain
  TOKEN_ADDRESS= ^# Token address in blockchain
  API_DOMAIN= ^# OPTIONAL default is https://acedev.tokenstars.com/api
  WEB3= ^# Node endpoint (default is http://127.0.0.1:8545)
  GAS_LIMIT= ^# Gas limit (default is 4100000)
  GAS_PRICE= ^# Gas price (default is 1000000000)
  DEBUG=*,-ACE:VERB ^# setup output channels 
  babel-node app.js %1
```

### Execute
```
npm i && ./start.bat
```