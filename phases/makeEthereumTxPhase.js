import Phase from './basePhase'

export default class MakeEthereumTxPhase extends Phase {
  static get key() { return "make-tx" }

  static async execute({ state, log, utils, ethTransaction, web3, TX_STATES, CONTRACT, CONSTANTS}) {
    log.info('Create new ethereum tx')
    const to = CONSTANTS.distributionAddress
    const data = CONTRACT.methods.bulkMint(state.mintData.accounts, state.mintData.amounts).encodeABI()
    const privateKey = CONSTANTS.privateKey//
    
    const gasLimit = utils.bufferToHex(CONSTANTS.gasLimit) // Gas limit used for deploys
    const gasPrice = utils.bufferToHex(CONSTANTS.gasPrice)
    const nonce = utils.bufferToHex(await web3.eth.getTransactionCount(CONSTANTS.fromAddress))

    const rawTx = {
      // call for nonce
      nonce,
      gasPrice,
      gasLimit,
      to,
      data,
    }

    const tx = new ethTransaction(rawTx)
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
}