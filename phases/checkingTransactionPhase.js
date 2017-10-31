import Phase from './basePhase'

export default class CheckingTransactionPhase extends Phase {
  static get key() { return 'check-transaction' }

  static async execute({ state, db, log, web3, MINT_STATES }) {
    const tx = await web3.eth.getTransactionReceipt(state.pendingTx.hash)
    
    if(tx && tx.blockHash) {
      // if(parseInt(tx.status)) {
      const success = typeof tx.status === "undefined" || !!parseInt(tx.status)

      db.get('mintingHistory').push({
        accounts: state.mintData.accounts,
        amounts:  state.mintData.amounts,
        ids: state.mintData.id,
        id: state.pendingTx.hash,
        block: tx.blockHash,
        blockHeight: tx.blockNumber,
        status: parseInt(tx.status),
        success: success,
        reported: false,
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
}