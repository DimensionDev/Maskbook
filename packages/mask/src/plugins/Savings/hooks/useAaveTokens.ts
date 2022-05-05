import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'

import {
    ChainId,
    createContract,
    EthereumTokenType,
    getAaveConstants,
    useFungibleTokensDetailed,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { flatten, compact } from 'lodash-unified'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'
import { splitToPair } from '../utils'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useAaveTokens(chainId: ChainId, web3: Web3) {
    const {
        value: aaveTokens = EMPTY_LIST,
        loading,
        error,
        retry,
    } = useAsyncRetry(async () => {
        if (chainId !== ChainId.Mainnet) return EMPTY_LIST

        const address = getAaveConstants(chainId).AAVE_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS

        const protocolDataContract = createContract<AaveProtocolDataProvider>(
            web3,
            address,
            AaveProtocolDataProviderABI as AbiItem[],
        )

        const tokens = await protocolDataContract?.methods.getAllReservesTokens().call()

        const aTokens = await protocolDataContract?.methods.getAllATokens().call()

        return tokens?.map((token) => {
            return [token[1], aTokens?.filter((f) => f[0].toUpperCase() === `a${token[0]}`.toUpperCase())[0][1]]
        })
    }, [web3, chainId])

    const { value: detailedAaveTokens, loading: loadingTokenDetails } = useFungibleTokensDetailed(
        compact(flatten(aaveTokens)).map((address: string) => {
            return { address, type: EthereumTokenType.ERC20 }
        }) ?? [],
        chainId,
    )

    return useMemo(
        () => ({
            tokenPairs: splitToPair(detailedAaveTokens),
            loading: loading || loadingTokenDetails,
            error,
            retry,
        }),
        [loading, detailedAaveTokens, loadingTokenDetails],
    )
}
