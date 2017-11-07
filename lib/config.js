export function collectConstants() {
  const distributionABI = require('../AceTokenDistribution.json').abi
  const tokenABI = require('../AceToken.json').abi
  
  const apiDomain = process.env.API_DOMAIN || 'https://acedev.tokenstars.com/api'
  const apiList = `${apiDomain}/list`
  const apiSent = `${apiDomain}/sent`

  console.log(process.env.PRIVATE_KEY)
  const privateKey = new Buffer(process.env.PRIVATE_KEY, 'hex')
  const fromAddress = process.env.FROM_ADDRESS.toLowerCase() //'0x4750A4bc51783648283370f8Ab55F8B7493323d1'.toLowerCase()
  
  const distributionAddress = process.env.DISTRIBUTION_ADDRESS.toLowerCase() // '0x30fc2315BC569b3fDB6fd812433C4c85AdF7Ba43'.toLowerCase()
  const tokenAddress        = process.env.TOKEN_ADDRESS.toLowerCase() // '0x87Aa42Ab921a7179ADD7e0152F2C85C08B78977E'.toLowerCase()

  const web3Endpoint = process.env.WEB3 || 'http://127.0.0.1:8545'

  const gasLimit = parseInt(process.env.GAS_LIMIT) || 4100000
  const gasPrice = parseInt(process.env.GAS_PRICE) || 1000000000
  const chainId = parseInt(process.env.CHAIN_ID) || 1

  return {
    privateKey,
    fromAddress,
    distributionAddress,
    tokenAddress,

    distributionABI,
    tokenABI,

    web3Endpoint,

    gasLimit,
    gasPrice,
    chainId,

    apiDomain,
    apiList,
    apiSent
  }
}

export function getDefaultDb() {
  return { 
    accounts: [],
    state: {
      mintData: null,
      pendingTx: null,
    },
    mintingHistory: [] 
  }
}