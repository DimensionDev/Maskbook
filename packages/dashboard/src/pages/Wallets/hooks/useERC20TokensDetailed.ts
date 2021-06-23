import {
    CONSTANTS,
    EthereumTokenType,
    isSameAddress,
    TOKEN_CONSTANTS,
    TokenListsState,
    useAssetsFromChain,
    useConstantNext,
    useERC20TokensDetailedFromTokenLists,
    useNativeTokenDetailed,
} from '@masknet/web3-shared'
import { uniqBy } from 'lodash-es'
import { useMemo } from 'react'

export function useERC20TokensDetailed() {
    const ERC20_TOKEN_LISTS = useConstantNext(CONSTANTS).ERC20_TOKEN_LISTS
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS)

    //#region mask token
    const MASK_ADDRESS = useConstantNext(TOKEN_CONSTANTS).MASK_ADDRESS
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
        loading: state !== TokenListsState.READY || assetsDetailedChainLoading,
        error: assetsDetailedChainError,
    }
}
