import Phase from './basePhase'

export default class PrepareMintDataPhase extends Phase {
  static get key() { return "mint-data" }

  static async execute({ state, db, log, MINT_STATES }) {
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

    log.verb(JSON.stringify(state.mintData, null, 2))
  }
}
