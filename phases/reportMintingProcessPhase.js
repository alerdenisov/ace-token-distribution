import fetch from 'node-fetch'
import Phase from './basePhase'

export default class ReportMintingProcessPhase extends Phase {
  static get key() { return 'report-minting' }

  static async execute({ state, db, CONSTANTS }) {
    const minted = db.get('mintingHistory').filter({ reported: false }).value()
    
    for (let mint of minted) {
      const report = mint.ids.map((id, index) => {
        return {
          id,
          success: mint.success,
          tx: mint.id,
          block: mint.block
        }
      })

      console.log(report)

      await fetch(CONSTANTS.apiSent, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(report)
      })

      db.get('mintingHistory').updateById(mint.id, { reported: true }).write()
    }
  }
}