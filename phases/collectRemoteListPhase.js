import fetch from 'node-fetch'
import Phase from './basePhase'

export default class CollectList extends Phase {
  static get key() { return "collect-list" }

  static async execute({state, db, log, MINT_STATES, CONSTANTS}) {
    log.info('Request new list')
    const listResponse = await fetch(CONSTANTS.apiList, {})
    
    if(listResponse.ok) 
    {
      const list = await listResponse.json()
      const accountCollection = db.get('accounts')
      
      list.forEach(el => {
        if (!el.id) return

        el.amount = Math.floor(el.amount)

        if(!accountCollection.getById(el.id).value()) {
          accountCollection.insert({
            state: MINT_STATES.NONE,
            ...el
          }).write()
        } else {
          log.verb(`Ignore duplicate id ${el.id}`)
        }
      })
    } 
    else 
    {
      log.err('List response return error')
      log.err(listResponse)
      return 1
    }
  }
}