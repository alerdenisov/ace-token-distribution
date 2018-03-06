import fetch from 'node-fetch'
import Phase from './basePhase'

function timeout(ms) {return new Promise(res => setTimeout(res, ms)) }

export default class CollectList extends Phase {
  static get key() { return "collect-list" }

  static async execute({state, db, log, MINT_STATES, CONSTANTS}) {
    log.info('Request new list')
    const listResponse = await fetch(CONSTANTS.apiList, {})
    
    if(listResponse.ok) 
    {
      
      const list = await listResponse.json()
      
      if(!list.length) {
        log.info('no more data from api (wait 10 sec before request)')
        await timeout(10000)
        return
      }

      const accountCollection = db.get('accounts')

      let count = 0
      
      list.forEach(el => {
        if (typeof el.id === 'undefined') return

        el.amount = Math.floor(el.amount)

        if(!accountCollection.getById(el.id).value()) {
          accountCollection.insert({
            ...el,
            state: MINT_STATES.NONE
          }).write()
          count++
        } else {
          log.verb(`Ignore duplicate id ${el.id}`)
        }
      })

      if(!count) {
        log.info('no more data from api (wait 10 sec before request)')
        await timeout(10000)
        return
      }
    } 
    else 
    {
      log.err('List response return error')
      log.err(listResponse)
      return 1
    }
  }
}