import Phase from './basePhase'

function timeout(ms) {return new Promise(res => setTimeout(res, ms)) }

export default class SendTransactionPhase extends Phase {
  static get key() { return 'send-tx' }

  static async execute({ state, web3, log, TX_STATES }) {
    log.info('Send ethereum tx')

    let done, error = null
    state.pendingTx.state = TX_STATES.PENDING

    web3.eth.sendSignedTransaction(state.pendingTx.raw)
      .once('transactionHash', hash => {
        log.info(`pending tx hash received ${hash}`)
        state.pendingTx.hash = hash
        done = true
      })
      .once('receipt', receipt => {
        log.info(`pending tx receipt received ${receipt.transactionHash}`)
        state.pendingTx.hash = hash
        done = true
      })
      .on('error', error => {
        log.info(`pending tx error ${error}`)
        error = error
      })
      .on('confirmation', (conf, receipt) => {
        log.info(`pending tx confirmation ${conf}`)
        log.info(`pending tx receipt received ${receipt.transactionHash}`)
        done = true
      })
      .then(receipt => {
        log.info(`pending tx has been mined ${receipt.transactionHash}`)
        log.verb(receipt)
        done = true
      })

    while(!done && !error) {
      await timeout(500)
    }
  }
}