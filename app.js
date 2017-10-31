import { collectConstants, getDefaultDb } from './lib/config'
import log from './lib/log'

import Web3 from 'web3'
import ethTransaction from 'ethereumjs-tx'
import utils from 'ethereumjs-util'

import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { sha256 } from 'js-sha256'
import lodashId from 'lodash-id'
import { MINT_STATES, TX_STATES, ERRORS } from './lib/enums'

import execute from './execute'




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
  check: async function (context) {
    console.log('test')
    const tx2 = await context.web3.eth.getTransactionReceipt('0x2f6c3de715b40dac1f6892bf4f98d1d0d964793d6569e6d4c35909498cc5b1a7')
    console.log(`status: ${typeof tx2.status === "undefined" || !!parseInt(tx2.status)}`)
    console.log(`events count: ${tx2.logs.length}`)

    delete tx2.logs;
    console.log(tx2);
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

  const state = db.get('state').value()

  const context = {
    state,
    db,
    log,
    web3,
    ethTransaction,
    utils,
    CONTRACT,
    CONSTANTS,
    MINT_STATES,
    TX_STATES,
    ERRORS
  }

  console.log(process.argv)
  if (process.argv.length > 2) {
    commands[process.argv[2]](context);
  } else {
    commands.loop(context)
  }
  
}

run()