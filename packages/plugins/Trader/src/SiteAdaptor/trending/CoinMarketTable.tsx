import { FungibleCoinMarketTable } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CurrencyType } from '@masknet/web3-shared-base'
import type { Trending } from '../../types/index.js'

interface CoinMarketTableProps {
    result: Web3Helper.TokenResultAll
    trending: Trending
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    return <FungibleCoinMarketTable {...props} sign={CurrencyType.USD} />
}
