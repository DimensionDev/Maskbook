import * as subgraph from './subgraph'
import * as pastEvents from './pastEvents'

export async function getPool(pid: string) {
    const pool = await subgraph.getPool(pid)
    const pool_ = await pastEvents.getPool(pid)

    console.log('DEBUG: get pool')
    console.log({
        pid,
        pool,
        pool_,
    })

    return pool
}

export { getTradeInfo, getAllPoolsAsBuyer, getAllPoolsAsSeller } from './subgraph'
