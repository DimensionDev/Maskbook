import * as thegraph from './thegraph'
import * as pastEvents from './pastEvents'

export async function getPool(pid: string) {
    const pool = await thegraph.getPool(pid)
    const pool_ = await pastEvents.getPool(pid)

    console.log('DEBUG: get pool')
    console.log({
        pid,
        pool,
        pool_,
    })

    return pool
}

export { getTradeInfo,  getAllPoolsAsBuyer, getAllPoolsAsSeller, } from './thegraph'
