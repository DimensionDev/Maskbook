import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { flatten, compact, orderBy, sortedUniqBy } from 'lodash-unified'
import type Web3 from 'web3'
import { VaultInterface, Yearn } from '@yfi/sdk'
import { ChainId, EthereumTokenType, useFungibleTokensDetailed } from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { isValidYearnChain, splitToPair } from '../utils'

export function useYearnTokens(chainId: ChainId, web3: Web3) {
    const {
        value: yfiTokens = EMPTY_LIST,
        loading,
        error,
        retry,
    } = useAsyncRetry(async () => {
        if (!isValidYearnChain(chainId)) {
            return EMPTY_LIST
        }
        const yearn = new Yearn(chainId, {
            provider: new Web3Provider(web3.currentProvider as ExternalProvider),
        })
        await yearn.ready

        const vaultInterface = new VaultInterface(yearn, chainId, yearn.context)

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
        compact(flatten(yfiTokens)).map((address: string) => ({ address, type: EthereumTokenType.ERC20 })) ?? [],
        chainId,
    )

    return useMemo(
        () => ({
            tokenPairs: splitToPair(detailedYFITokens),
            loading: loading || loadingTokenDetails,
            error: error,
            retry,
        }),
        [chainId, detailedYFITokens, loadingTokenDetails],
    )
}
