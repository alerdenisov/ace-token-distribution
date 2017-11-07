import Phase from './basePhase'

export default class SendTransactionPhase extends Phase {
  static get key() { return 'send-tx' }

  static async execute({ state, web3, log, TX_STATES }) {
    log.info('Send ethereum tx')
    // try {
    const receipt = await web3.eth.sendSignedTransaction(state.pendingTx.raw)
    state.pendingTx.state = TX_STATES.PENDING
    state.pendingTx.hash = receipt.transactionHash
    // } 
    // catch (e) 
    // {
      // state.pendingTx.state = TX_STATES.FAIL
      // state.pendingTx.error = e
    // }
  }
}