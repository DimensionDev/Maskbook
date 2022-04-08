import { useAsync} from 'react-use'

import {
    ChainId,
    EthereumTokenType,
    FungibleTokenDetailed,
    useFungibleTokensDetailed
} from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { VaultInterface, Yearn } from '@yfi/sdk'

import { isValidYearnChain, splitToPair } from '../utils'
import { flatten, compact, orderBy, sortedUniqBy } from 'lodash-unified'
import type Web3 from 'web3'


export function useYearnTokens( chainId: ChainId, web3: Web3) {
    const [tokenPairs, setTokenPairs] = useState<[FungibleTokenDetailed, FungibleTokenDetailed][]>([]);

	const { value: yfiTokens, loading } = useAsync(async () => {
        if (!isValidYearnChain(chainId)) {
            return []
        }

        // @ts-ignore
        const yearn = new Yearn(chainId, {
            // @ts-ignore
            provider: web3.currentProvider,
        })
        await yearn.ready

        // @ts-ignore
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
        chainId
    )

    setTokenPairs( splitToPair(detailedYFITokens))

    return {
        tokenPairs: tokenPairs,
        loading: loading || loadingTokenDetails,

    }
}



