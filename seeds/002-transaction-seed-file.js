module.exports = async function seedTransactions(pool) {
  const faker = require('faker')
  const db = require('../db/db')
  const res = await pool.query('SELECT id FROM users')
  const countRes = await pool.query('SELECT COUNT(*) AS count FROM transactions')
  const count = Number(countRes.rows[0].count)
  console.log('transaction table count =', count)


  if (count === 0) {
    for (let userId of res.rows.map(row => row.id)) {
      let transaction_date = new Date(2023, 6, 1)
      try {
        for (let i = 0; i < 100; i++) {
          const price = Math.floor(Math.random() * 200) + 17800
          const quantity = Math.floor(Math.random() * 9) + 1
          const action = i % 2 === 0 ? 'buy' : 'sell'
          const description = faker.lorem.sentence()
          const ispublic = i % 2 === 0 ? true : false
          transaction_date.setHours(transaction_date.getHours() + Math.floor(Math.random() * 3) + 2)
          try {
            let remainingQuantity = quantity
            let transaction = await db.createTransaction(userId, action, quantity, price, transaction_date, description, ispublic)
            //找反向交易
            let oppositeTransaction = await db.findOppositeOpenTransaction(userId, action)
            while (oppositeTransaction && remainingQuantity > 0) {
              /*---------------如果反向交易未平倉量 >= 當前交易紀錄的數量-----------------*/
              if (oppositeTransaction.open_quantity >= remainingQuantity) {
                let newOpenQuantity = oppositeTransaction.open_quantity - remainingQuantity
                //建立平倉紀錄
                await db.createClosure(oppositeTransaction.id, transaction.id, quantity, price)
                //更新反向交易
                await db.updateTransactionStatus(oppositeTransaction.id, oppositeTransaction.open_quantity - remainingQuantity, newOpenQuantity === 0 ? 'closed' : 'open')
                //更新當前交易
                const pandl = oppositeTransaction.action === 'buy' ? transaction.price - oppositeTransaction.price : oppositeTransaction.price - transaction.price
                await db.updateTransactionStatus(transaction.id, 0, 'closed', 'closing_position', pandl)
                remainingQuantity = 0
              }
              /*---------------如果反向交易未平倉量 < 當前交易紀錄的數量-----------------*/
              else if (oppositeTransaction.open_quantity < remainingQuantity) {
                //新增平倉紀錄
                await db.createClosure(oppositeTransaction.id, transaction.id, oppositeTransaction.open_quantity, price)
                //更新反向交易
                await db.updateTransactionStatus(oppositeTransaction.id, 0, 'closed')
                //更新當前交易
                const pandl = oppositeTransaction.action === 'buy' ? transaction.price - oppositeTransaction.price : oppositeTransaction.price - transaction.price
                await db.updateClosingTransaction(oppositeTransaction.open_quantity, 'closing_position', 0, 'closed', pandl, transaction.id)
                //更新剩餘數量、新增交易紀錄
                remainingQuantity -= oppositeTransaction.open_quantity
                transaction = await db.createTransaction(userId, action, remainingQuantity, price, transaction_date, description, ispublic)
                oppositeTransaction = await db.findOppositeOpenTransaction(userId, action)
              }
            }
          } catch (err) {
            console.log(err)
          }
        }
      } catch (err) {
        console.error(`Error: ${err.message}`)
      }
    }
    console.log('success created transaction seeds')
  } else {
    console.log('transaction table is not empty')
  }
}
