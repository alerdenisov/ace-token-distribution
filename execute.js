// Phases
import CollectRemoveList from './phases/collectRemoteListPhase'
import PrepareMintData from './phases/prepareMintDataPhase'
import MakeEthereumTx from './phases/makeEthereumTxPhase'
import SendTransaction from './phases/sendTransactionPhase'
import CheckingTransaction from './phases/checkingTransactionPhase'
import ReportProcess from './phases/reportMintingProcessPhase'


export default async function execute(context) {
  // Eject dependencies
  const { state, db, log, ERRORS, MINT_STATES, TX_STATES } = context
  if (false) {} // pretify if-else block
  else if (db.get('mintingHistory').filter({ reported: false }).value().length) {
    return await ReportProcess.execute(context)
  }
  else if (!state.mintData && !db.get('accounts').filter({ state: MINT_STATES.NONE }).value().length) {
    return await CollectRemoveList.execute(context)
  }
  else if (!state.mintData) {
    return await PrepareMintData.execute(context)
  }
  else if (!state.pendingTx) {
    return await MakeEthereumTx.execute(context)
  }
  else if (state.pendingTx.state === TX_STATES.NONE) {
    return await SendTransaction.execute(context)
  }
  else if (state.pendingTx.state === TX_STATES.PENDING) {
    return await CheckingTransaction.execute(context)
  }
  else if (state.pendingTx.state === TX_STATES.DONE) {
    return await ReportProcess.execute(context)
  }
  else if (state.pendingTx.state === TX_STATES.FAIL) {
    log.err('Tx is failed...')
    log.err(state.pendingTx.error)
    return { 
      key: ERRORS.TransactionSendFailed,
      exception: state.pendingTx.error
    }
  }
}