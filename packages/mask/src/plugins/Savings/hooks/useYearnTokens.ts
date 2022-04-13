import { useAsync } from 'react-use'

import { ChainId, EthereumTokenType, useFungibleTokensDetailed } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { VaultInterface, Yearn } from '@yfi/sdk'

import { isValidYearnChain, splitToPair } from '../utils'
import { flatten, compact, orderBy, sortedUniqBy } from 'lodash-unified'
import type Web3 from 'web3'

export function useYearnTokens(chainId: ChainId, web3: Web3) {
    
    const { value: yfiTokens, loading } = useAsync(async () => {
        
        if (!isValidYearnChain(chainId)) {
            return []
        }

        // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
        const yearn = new Yearn(chainId, {
            provider: web3.currentProvider,
        })
        await yearn.ready
        
        // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
        const vaultInterface = new VaultInterface(yearn, +chainId, yearn.context)

        const allVaults = await vaultInterface.get()
        const currentVaults = sortedUniqBy(
            orderBy(allVaults, ['metadata.defaultDisplayToken', 'version'], ['asc', 'desc']),
            (m) => m.metadata.defaultDisplayToken,
        )
        

        return currentVaults.map((v) => {
            return [v.metadata.defaultDisplayToken, v.address]
        })
    }, [web3, chainId])

    const { value: detailedYFITokens, loading: loadingTokenDetails } = useFungibleTokensDetailed(
        compact(flatten(yfiTokens ?? [])).map((address: string) => {
            return { address, type: EthereumTokenType.ERC20 }
        }) ?? [],
        chainId,
    )

    return useMemo(
        () => {
            return {
                tokenPairs: splitToPair(detailedYFITokens),
                loading: loading || loadingTokenDetails
            }
        },
        [chainId, detailedYFITokens, loadingTokenDetails],
    )
}
