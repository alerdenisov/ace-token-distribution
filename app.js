import fetch from 'node-fetch'
import { collectConstants, getDefaultDb } from './lib/config'
import log from './lib/log'
import fs from 'fs';
import {promisify} from 'util'
import Web3 from 'web3'
import ethTransaction from 'ethereumjs-tx'
import utils from 'ethereumjs-util'

import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { sha256 } from 'js-sha256'
import lodashId from 'lodash-id'
import { MINT_STATES, TX_STATES, ERRORS } from './lib/enums'

import execute from './execute'


const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)


function saveState({state, db, log}) {
  const hash = sha256(JSON.stringify(state))//.hex()
  if (state.hash !== hash) 
  {
    state.hash = hash;
    log.verb(`New state ${hash}`)
    db.set('state', state)
  }
}

const commands = {
  report: async function({ db, TOKEN, CONSTANTS }, args) {
    // let history
    // const specialDb = args[3] || false
    // if (specialDb) {
    //   let json = JSON.parse(await readFile(specialDb))
    //   history = json.mintingHistory
    // } else {
    //   history = db.getState().mintingHistory
    // }

    const block = parseInt(args[4]) || 0

    let accs = db.getState().accounts.map(acc => {
      return {
        state: acc.state,
        id: acc.id,
        wallet: acc.wallet.toLowerCase(),
        amount: acc.amount
      }
    })

    TOKEN.getPastEvents('Mint', {
        // filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
        fromBlock: block,
        toBlock: 'latest',
    }, async (error, events) => { 
      if(error) {
        return console.error(error)
      }

      const report = events.map(e => {
        const acc = accs.filter(acc => acc.wallet == e.returnValues.to.toLowerCase())
        if (!acc.length) {
          console.log('acc not found')
          console.log(e.returnValues.to)
        } else {
          return {
            id: acc[0].id,
            success: true,
            wallet: e.returnValues.to,
            amount: e.returnValues.amount,
            tx: e.transactionHash,
            block: e.blockHash
          }
        }
      })

      await writeFile(`report-${new Date().toDateString()}.json`, JSON.stringify(report, null, 2))

      await fetch(CONSTANTS.apiSent, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(report)
      })
    })
  },
  testTx: async function({ state, log, utils, ethTransaction, web3, TX_STATES, CONTRACT, CONSTANTS}, args) {
    const index = parseInt(args[3])
    log.info('Create test ethereum tx')
    const to = CONSTANTS.distributionAddress
    const data = CONTRACT.methods.bulkMint(state.mintData.accounts, state.mintData.amounts).encodeABI()
    const privateKey = CONSTANTS.privateKey//
    
    const gasLimit = utils.bufferToHex(CONSTANTS.gasLimit) // Gas limit used for deploys
    const gasPrice = utils.bufferToHex(CONSTANTS.gasPrice)
    const nonce = utils.bufferToHex(await web3.eth.getTransactionCount(CONSTANTS.fromAddress))

    const tx = new ethTransaction(null, CONSTANTS.chainId)
    tx.nonce = nonce
    tx.gasLimit = gasLimit
    tx.gasPrice = gasPrice
    tx.to = to
    tx.data = data

    tx.sign(privateKey)

    console.log(tx)

    // const raw = `0x${tx.serialize().toString('hex')}`

    // state.pendingTx = {
    //   raw,
    //   state: TX_STATES.NONE,
    //   hash: null
    // }
    //   web3.eth.sendSignedTransaction(serializedTx.toString('hex'))
    //log.verb(state.pendingTx)
  },
  check: async function ({log, web3}) {
    const tx2 = await web3.eth.getTransactionReceipt('0x2f6c3de715b40dac1f6892bf4f98d1d0d964793d6569e6d4c35909498cc5b1a7')
    log.info(`status: ${typeof tx2.status === "undefined" || !!parseInt(tx2.status)}`)
    log.info(`events count: ${tx2.logs.length}`)

    delete tx2.logs;
    log.verb(tx2);
  },
  loop: async function (context) {
    try {
      const error = await execute(context)
      context.db.write()

      if (error) {
        context.log.err(JSON.stringify(error, null, 2))
      }
      else {
        setTimeout(() => commands.loop(context), 1000)
      }
    } catch(error) {
      context.log.err(error)
    }
  }
}
async function run() {
  const CONSTANTS = collectConstants()
  const web3 = new Web3(CONSTANTS.web3Endpoint)
  
  const adapter = new FileSync(`db-${sha256(JSON.stringify(CONSTANTS))}.json`)
  const db = lowdb(adapter)

  db._.mixin(lodashId)
  db.defaults(getDefaultDb()).write()


  const CONTRACT = await new web3.eth.Contract(CONSTANTS.distributionABI, CONSTANTS.distributionAddress, {
    gas: CONSTANTS.gasLimit,
    gasPrice: CONSTANTS.gasPrice
  })

  const TOKEN = await new web3.eth.Contract(CONSTANTS.tokenABI, CONSTANTS.tokenAddress, {
    gas: CONSTANTS.gasLimit,
    gasPrice: CONSTANTS.gasPrice
  })

  const state = db.get('state').value()

  const context = {
    state,
    db,
    log,
    web3,
    ethTransaction,
    utils,
    CONTRACT,
    TOKEN,
    CONSTANTS,
    MINT_STATES,
    TX_STATES,
    ERRORS
  }

  if (process.argv.length > 2) {
    commands[process.argv[2]](context, process.argv);
  } else {
    commands.loop(context)
  }
  
}

run()