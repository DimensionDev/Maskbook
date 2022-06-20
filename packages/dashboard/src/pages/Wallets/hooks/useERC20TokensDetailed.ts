export function useERC20TokensDetailed() {
    // const { FUNGIBLE_TOKEN_LISTS = [] } = useTokenListConstants()
    // const { value: nativeTokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)
    // const { value: erc20TokensDetailed = [], loading: erc20TokensDetailedLoading } = useFungibleTokensFromTokenList(
    //     NetworkPluginID.PLUGIN_EVM,
    // )

    // // #region mask token
    // const { MASK_ADDRESS } = useTokenConstants()
    // // #endregion

    // const tokens = useMemo(
    //     () =>
    //         uniqBy(
    //             nativeTokenDetailed ? [nativeTokenDetailed, ...erc20TokensDetailed] : [...erc20TokensDetailed],
    //             (x) => x.address.toLowerCase(),
    //         ).sort((a, z) => {
    //             if (a.type === SchemaType.Native) return -1
    //             if (z.type === SchemaType.Native) return 1
    //             if (isSameAddress(a.address, MASK_ADDRESS)) return -1
    //             if (isSameAddress(z.address, MASK_ADDRESS)) return 1
    //             return 0
    //         }),
    //     [nativeTokenDetailed, erc20TokensDetailed.length],
    // )

    // const {
    //     value: assetsDetailedChain = [],
    //     loading: assetsDetailedChainLoading,
    //     error: assetsDetailedChainError,
    // } = useAssetsFromChain(tokens)

    // return {
    //     value: assetsDetailedChain,
    //     loading: erc20TokensDetailedLoading || assetsDetailedChainLoading,
    //     error: assetsDetailedChainError,
    // }
    return {
        value: [],
        loading: false,
        error: undefined,
    }
}
