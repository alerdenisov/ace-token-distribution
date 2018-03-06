const fastify = require('fastify')()
const fastifyCaching = require('fastify-caching')

fastify.register(
  fastifyCaching,
  {
    privacy: fastifyCaching.privacy.NOCACHE
  },
  (err) => { if (err) throw err }
)

function randomRange(min, max) {
  return min + Math.random() * (max - min)
}

function toTokens(amount) {
  return Math.floor(amount * 10e4)
}

const db = {
  "1":  { id: 1,  wallet: "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1", amount: toTokens(randomRange(1, 15)), status: 0 },
  "2":  { id: 2,  wallet: "0xffcf8fdee72ac11b5c542428b35eef5769c409f0", amount: toTokens(randomRange(1, 15)), status: 0 },
  "3":  { id: 3,  wallet: "0x22d491bde2303f2f43325b2108d26f1eaba1e32b", amount: toTokens(randomRange(1, 15)), status: 0 },
  "4":  { id: 4,  wallet: "0xe11ba2b4d45eaed5996cd0823791e0c93114882d", amount: toTokens(randomRange(1, 15)), status: 0 },
  "5":  { id: 5,  wallet: "0xd03ea8624c8c5987235048901fb614fdca89b117", amount: toTokens(randomRange(1, 15)), status: 0 },
  "6":  { id: 6,  wallet: "0x95ced938f7991cd0dfcb48f0a06a40fa1af46ebc", amount: toTokens(randomRange(1, 15)), status: 0 },
  "7":  { id: 7,  wallet: "0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9", amount: toTokens(randomRange(1, 15)), status: 0 },
  "8":  { id: 8,  wallet: "0x28a8746e75304c0780e011bed21c72cd78cd535e", amount: toTokens(randomRange(1, 15)), status: 0 },
  "9":  { id: 9,  wallet: "0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e", amount: toTokens(randomRange(1, 15)), status: 0 },
  "10": { id: 10, wallet: "0x1df62f291b2e969fb0849d99d9ce41e2f137006e", amount: toTokens(randomRange(1, 15)), status: 0 },
  "11": { id: 11, wallet: "0xf52ccfcc2220e637da83337236b319958cf35595", amount: toTokens(randomRange(1, 15)), status: 0 },
  "12": { id: 12, wallet: "0xb8b94cca09bb25a90615d99c9b476b123a1c3a51", amount: toTokens(randomRange(1, 15)), status: 0 },
}

// Declare a route
fastify.get('/list', async (request, reply) => {
  return Object.values(db).filter(r => r.status === 0)
})

fastify.post('/sent', async (request, reply) => {
  console.log(request.body)
  request.body.filter(r => r.success).forEach(r => {
    console.log(`update record id ${r.id}`)
    db[r.id.toString()].status = 1
  })

  console.log(Object.values(db))
  return true
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(8000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()