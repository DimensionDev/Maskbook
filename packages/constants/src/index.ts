import { ChainId } from '@dimensiondev/web3-shared'
import { memoize } from 'lodash-es'
import trade from './trade-constants.json'

export const getTradeConstants = memoize((chainId = ChainId.Mainnet) => {
    type Constants = typeof trade
    type Table = { [key in keyof Constants]: Constants[key]['Mainnet'] }

    const table = {} as Table
    const chainName = ChainId[chainId]
    for (const name in trade) {
        table[name] = trade[name][chainName]
    }
    return Object.freeze(table)
})
