import {
    EthereumTokenType,
    isSameAddress,
    useAssetsFromChain,
    useERC20TokensDetailedFromTokenLists,
    useEthereumConstants,
    useNativeTokenDetailed,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { uniqBy } from 'lodash-unified'
import { useMemo } from 'react'

export function useERC20TokensDetailed() {
    const { ERC20_TOKEN_LISTS } = useEthereumConstants()
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const { value: erc20TokensDetailed = [], loading: erc20TokensDetailedLoading } =
        useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS)

    //#region mask token
    const { MASK_ADDRESS } = useTokenConstants()
    //#endregion

    const tokens = useMemo(
        () =>
            uniqBy(
                nativeTokenDetailed ? [nativeTokenDetailed, ...erc20TokensDetailed] : [...erc20TokensDetailed],
                (x) => x.address.toLowerCase(),
            ).sort((a, z) => {
                if (a.type === EthereumTokenType.Native) return -1
                if (z.type === EthereumTokenType.Native) return 1
                if (isSameAddress(a.address, MASK_ADDRESS)) return -1
                if (isSameAddress(z.address, MASK_ADDRESS)) return 1
                return 0
            }),
        [nativeTokenDetailed, erc20TokensDetailed.length],
    )

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
    } = useAssetsFromChain(tokens)

    return {
        value: assetsDetailedChain,
        loading: erc20TokensDetailedLoading || assetsDetailedChainLoading,
        error: assetsDetailedChainError,
    }
}
