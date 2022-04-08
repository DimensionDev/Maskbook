import { useAsync} from 'react-use'

import {
    ChainId,
    createContract,
    EthereumTokenType,
    FungibleTokenDetailed,
    getAaveConstants,
    useFungibleTokensDetailed,
    ZERO_ADDRESS
} from '@masknet/web3-shared-evm'
import { useState } from 'react'
import type { AbiItem } from 'web3-utils'
import {  splitToPair } from '../utils'
import { flatten, compact } from 'lodash-unified'
import type Web3 from 'web3'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'


export function useAaveTokens( chainId: ChainId, web3: Web3) {

    const [tokenPairs, setTokenPairs] = useState<[FungibleTokenDetailed, FungibleTokenDetailed][]>([]);

	const { value: aaveTokens, loading } = useAsync(async () => {
        if (chainId !== ChainId.Mainnet) {
            return []
        }

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
        compact(flatten(aaveTokens ?? [])).map((address: string) => {
            return { address, type: EthereumTokenType.ERC20 }
        }) ?? [],
        chainId
    )

    setTokenPairs( splitToPair(detailedAaveTokens))

    return {
        tokenPairs: tokenPairs,
        loading: loading || loadingTokenDetails,

    }
}



