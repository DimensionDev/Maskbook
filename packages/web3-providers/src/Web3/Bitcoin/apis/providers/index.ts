import { memoize } from 'lodash-es'
import type { ChainId } from '@masknet/web3-shared-bitcoin'
import type { BlockchainBaseAPI } from '../../../../entry-types.js'
import { OKXLinkAPI } from './OKXLink/index.js'
import { BlockchainAPI } from './Blockchain/Blockchain.js'
import { attemptUntil } from '@masknet/web3-shared-base'

export const createWeb3SDK = memoize((chainId: ChainId) => {
    const providers = [new BlockchainAPI(), new OKXLinkAPI()]

    return new Proxy<BlockchainBaseAPI.Provider>(
        {},
        {
            get(target, p, receiver) {
                return (...args: unknown[]) => {
                    return attemptUntil(providers.map((x) => x[p].apply(x, args)))
                }
            },
        },
    )
}) as (chainId: ChainId) => BlockchainBaseAPI.Provider
