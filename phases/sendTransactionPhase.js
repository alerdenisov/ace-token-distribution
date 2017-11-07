import Phase from './basePhase'

class BreakSignal {}

function timeout(ms) {return new Promise(res => setTimeout(res, ms)) }

export default class SendTransactionPhase extends Phase {
  static get key() { return 'send-tx' }

  static async execute({ state, web3, log, TX_STATES }) {
    log.info('Send ethereum tx')

    let done, error, hash = null
    state.pendingTx.state = TX_STATES.PENDING

    web3.eth.sendSignedTransaction(state.pendingTx.raw)
      .once('transactionHash', hash => {
        hash = hash
        done = true
        // throw new BreakSignal()
      })
      .once('receipt', receipt => {
        hash = hash
        done = true
        // throw new BreakSignal()
      })
      .on('error', error => {
        log.info(`pending tx error ${error}`)
        error = error
        // throw new BreakSignal()
      })
      .on('confirmation', (conf, receipt) => {
        hash = receipt.transactionHash
        done = true
        // throw new BreakSignal()
      })
      .then(receipt => {
        hash = receipt.transactionHash
        log.verb(receipt)
        done = true
        // throw new BreakSignal()
      })
      // .catch(BreakSignal, () => {
      //   log.info(`break tx listening ${hash}`)
      // })

    while(!done && !error) {
      await timeout(500)
    }

    state.pendingTx.hash = hash
  }
}