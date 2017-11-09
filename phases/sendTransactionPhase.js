import Phase from './basePhase'

class BreakSignal {}

function timeout(ms) {return new Promise(res => setTimeout(res, ms)) }

export default class SendTransactionPhase extends Phase {
  static get key() { return 'send-tx' }

  static async execute({ state, web3, log, TX_STATES }) {
    log.info('Send ethereum tx')

    let done, error, txHash = null
    state.pendingTx.state = TX_STATES.PENDING

    web3.eth.sendSignedTransaction(state.pendingTx.raw)
      .once('transactionHash', hash => {
        log.info(`tx hash ${hash}`)
        if(!txHash && hash) {
          txHash = hash
        }
        done = true
        // throw new BreakSignal()
      })
      .once('receipt', receipt => {
        log.info(`tx repeipt`)
        if(!txHash && receipt.transactionHash) {
          txHash = receipt.transactionHash
        }
        done = true
      })
      .on('error', error => {
        log.info(`pending tx error ${error}`)
        error = error
        // throw new BreakSignal()
      })
      .on('confirmation', (conf, receipt) => {
        if(!txHash && receipt.transactionHash) {
          txHash = receipt.transactionHash
        }
        done = true
        // throw new BreakSignal()
      })
      .then(receipt => {
        if(!txHash && receipt.transactionHash) {
          txHash = receipt.transactionHash
        }

        log.verb(receipt)
        done = true
      })

    while(!done && !error) {
      await timeout(500)
    }

    if (!txHash) {
      throw new Error('Hash of tx not received')
    }

    state.pendingTx.hash = txHash
  }
}