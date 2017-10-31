const TX_STATES = {
  NONE: 0,
  PENDING: 1,
  DONE: 2,
  FAIL: 3
}

const MINT_STATES = {
  NONE: 0,
  MINTING: 1,
  DONE: 2,
  FAIL: -1,
  SENT: 3
}

const fetch = require('node-fetch')
const Web3 = require('web3')
const ethtx = require('ethereumjs-tx')
const ethutil = require('ethereumjs-util')
const ethwallet = require('ethereumjs-wallet')
const chalk = require('chalk')
const log = require('./lib/log.js')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const sha256 = require('js-sha256').sha256;

db._.mixin(require('lodash-id'))
db.defaults({ 
  accounts: [],
  state: {
    mintData: null,
    pendingTx: null,
  },
  mintingHistory: [] 
}).write()


const apiDomain = 'https://acedev.tokenstars.com/api'
const apiList = `${apiDomain}/list`
const apiSent = `${apiDomain}/sent`

const ethDistributionContractABI = require('./AceTokenDistribution.json').abi
const ethTokenContractABI = require('./AceToken.json').abi

const ethPrivate = process.env.PRIVATE_KEY// 'a3231cab3c2e1b8b9ab8d24433ab5b231ba8afd508de0d7808cb755e2081a3b2'
const ethFrom = '0x4750A4bc51783648283370f8Ab55F8B7493323d1'.toLowerCase()

const ethDistributionContract = process.env.DISTRIBUTION_CONTRACT// '0x30fc2315BC569b3fDB6fd812433C4c85AdF7Ba43'.toLowerCase()
const ethTokenContract        = process.env.TOKEN_CONTRACT// '0x87Aa42Ab921a7179ADD7e0152F2C85C08B78977E'.toLowerCase()

const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');

let CONTRACT;

log.err(chalk.red('hello world'))


function initialState() {
  const state = db.get('state').value()
  return state
}

async function run() {
  // await loop()

  // const tx1 = await web3.eth.getTransactionReceipt('0xb7ff6a33ac5877023b5ae8a10e7bb696ebb59365d564f7ecc9fc8defeb825b5a')
  // console.log(`status: ${parseInt(tx1.status)}`)
  // console.log(`events count: ${tx1.logs.length}`)
  
  const tx2 = await web3.eth.getTransactionReceipt('0xb8c5195e7b78f3faea0cbb1280152b1399233b846b3b82316660b8712cddecd5')
  console.log(`status: ${parseInt(tx2.status)}`)
  console.log(`events count: ${tx2.logs.length}`)

  tx2.logs.forEach(log => {
    console.log(log)
  })
  
}

async function collectList(state) {
  // call for list
  const listResponse = await fetch(apiList, {})
  
  if(listResponse.ok) 
  {
    log.info('Request new list')
    const list = await listResponse.json()
    const accountCollection = db.get('accounts')
    
    list.forEach(el => {
      if (!el.id) return

      if(!accountCollection.getById(el.id).value()) {
        accountCollection.insert({
          state: MINT_STATES.NONE,
          ...el
        }).write()
      } else {
        console.log(accountCollection.getById(el.id).value())
      }
    });
  } 
  else 
  {
    log.err('List response return error')
    log.err(listResponse)
  }
}

async function mintData(state) {
  log.info('Slice to mint')
  const mintSlice = db.get('accounts').filter({ state: MINT_STATES.NONE }).take(50).value()

  state.mintData = mintSlice.reduce((acc, el) => {
    acc.accounts.push(el.wallet)
    acc.amounts.push(el.amount)
    acc.id.push(el.id)
    el.state = MINT_STATES.MINTING
    return acc
  }, 
  {
    accounts: [],
    amounts: [],
    id: []
  })

  db.write() // ?

  log.verb(JSON.stringify(state.mintData, null, 2))
}

async function getDistributionContract(state) {
  CONTRACT = new web3.eth.Contract(ethDistributionContractABI, ethDistributionContract, {
    gas: 4100000,
    gasPrice: '1000000000'
  })
}

async function makeTx(state) {
  log.info('Create new ethereum tx')
  const to = ethDistributionContract
  const data = CONTRACT.methods.bulkMint(state.mintData.accounts, state.mintData.amounts).encodeABI()
  const privateKey = new Buffer(ethPrivate, 'hex')
  
  const gasLimit = ethutil.bufferToHex(4612388) // Gas limit used for deploys
  const gasPrice = ethutil.bufferToHex(10000000000)
  const nonce = ethutil.bufferToHex(await web3.eth.getTransactionCount(ethFrom))

  const rawTx = {
    // call for nonce
    nonce,
    gasPrice,
    gasLimit,
    to,
    data,
  }

  const tx = new ethtx(rawTx)
  tx.sign(privateKey)

  const raw = `0x${tx.serialize().toString('hex')}`

  state.pendingTx = {
    raw,
    state: TX_STATES.NONE,
    hash: null
  }
  //   web3.eth.sendSignedTransaction(serializedTx.toString('hex'))
  
  //log.verb(state.pendingTx)
}

async function sendTx(state) {
  try {
    const receipt = await web3.eth.sendSignedTransaction(state.pendingTx.raw)
    console.log(receipt)
    state.pendingTx.state = TX_STATES.PENDING
    state.pendingTx.hash = receipt.transactionHash
  } 
  catch (e) 
  {
    state.pendingTx.state = TX_STATES.FAIL
    state.pendingTx.error = e
  }
}

async function checkPendingTx(state) {
  const tx = await web3.eth.getTransactionReceipt(state.pendingTx.hash)
  
  if(tx && tx.blockHash) {
    // if(parseInt(tx.status)) {
    const success = !!parseInt(tx.status)

    db.get('mintingHistory').push({
      accounts: state.mintData.accounts,
      amounts:  state.mintData.amounts,
      ids: state.mintData.id,
      tx: state.pendingTx.hash,
      block: tx.blockHash,
      blockHeight: tx.blockNumber,
      status: parseInt(tx.status),
      success: success,
      eventsCount: tx.logs ? tx.logs.length : 0
    }).write()

    db.write()

    state.mintData.id.forEach(id => {
      db.get('accounts').updateById(id, { state: success ? MINT_STATES.DONE : MINT_STATES.FAIL }).write()
    })

    state.mintData = null
    state.pendingTx = null
  } 
  else 
  {
    log.verb(`Tx pending ${state.pendingTx.hash}`)
  }
}

async function loop(state, delay) {
  try {
    if (typeof state === "undefined") 
    {
      state = initialState()
    } 
    else 
    {
      const hash = sha256(JSON.stringify(state))//.hex()
      if (state.hash !== hash) 
      {
        state.hash = hash;
        log.verb(`New state ${hash}`)
        // db.get('history').push(state).write()
        db.set('state', state).write()
      }
    }

    if (delay) 
    {
      return setTimeout(() => loop(state), delay)
    }

    // Loop body
    if (false) {}
    else if (!CONTRACT) {
      log.info('Request distribution contract')
      await getDistributionContract()
      return loop(state)
    }
    else if (!state.mintData && !db.get('accounts').filter({ state: MINT_STATES.NONE }).value().length)//state.mintingQueue || !Object.keys(state.mintingQueue).length) 
    {
      log.info('Request minting list')
      await collectList(state)
      return loop(state)
    }
    else if (!state.mintData)
    {
      log.info('Collect list to mint tx')
      await mintData(state)
      return loop(state)
    }
    else if (!state.pendingTx) {
      log.info('Create tx')
      await makeTx(state)
      return loop(state, 1000)
    }
    else if (state.pendingTx.state === TX_STATES.NONE) {
      log.info('Send tx to blockchain')
      await sendTx(state)
      return loop(state, 1000)
    }
    else if (state.pendingTx.state === TX_STATES.FAIL) {
      log.err('Tx is failed...')
      log.err(state.pendingTx.error)
      return
    }
    else if (state.pendingTx.state === TX_STATES.PENDING) {
      // check status here
      log.info('Checking tx state')
      await checkPendingTx(state)
      return loop(state, 5000)
    }


    log.info(chalk.green('tick'))
  } catch (e) {
    log.err(e)
    return
  }
  
  log.info('Wait for next phase')
  loop(state, 30000) // once per second
}

run()