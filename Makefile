PRIVATE_KEY 					:=4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d	# Private key to sign distribution transactions
FROM_ADDRESS 					:=0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1												# Address of wallet unlocks with providen pkey
DISTRIBUTION_ADDRESS 	:=0xc89ce4735882c9f0f0fe26686c53074e09b0d550												# Address of token distribution contract
TOKEN_ADDRESS 				:=0xcfeb869f69431e42cdb54a4f4f105c19c080a601												# Address of token smart-contract
WEB3 									:=http://127.0.0.1:8545																							# Ethereum Node RPC
DEBUG 								:=ACE:ERROR,ACE:INFO,ACE:WARNING																		# Output log channels
GAS_LIMIT 						:=3500000																														# Gas limit in transaction execution
GAS_PRICE 						:=1000000000																												# Gas price in wei
API_DOMAIN 						:=http://localhost:8000																							# API endpoint

run:
	@exec $(shell pwd)/node_modules/.bin/cross-env \
		PRIVATE_KEY=$(value PRIVATE_KEY) \
		FROM_ADDRESS=$(value FROM_ADDRESS) \
		DISTRIBUTION_ADDRESS=$(value DISTRIBUTION_ADDRESS) \
		TOKEN_ADDRESS=$(value TOKEN_ADDRESS) \
		WEB3=$(value WEB3) \
		DEBUG=$(value DEBUG) \
		GAS_LIMIT=$(value GAS_LIMIT) \
		GAS_PRICE=$(value GAS_PRICE) \
		API_DOMAIN=$(value API_DOMAIN) \
		CHAIN_ID=$(value CHAIN_ID) \
			$(shell pwd)/node_modules/.bin/babel-node $(shell pwd)/app.js