import { createLookupTableResolver } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const resolveChain = createLookupTableResolver<string, ChainId | undefined>(
    {
        ethereum: ChainId.Mainnet,
        'binance-smart-chain': ChainId.BSCT,
        'polygon-pos': ChainId.Matic,
    },
    undefined,
)
