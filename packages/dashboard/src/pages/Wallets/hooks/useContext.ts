import { createContainer } from 'unstated-next'
import { type NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import {
    useFungibleAssets,
    useChainContext,
    useFungibleTokensFromTokenList,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'

function useContext(initialState?: { account?: string; chainId?: Web3Helper.ChainIdAll; pluginID?: NetworkPluginID }) {
    const { account, chainId } = useChainContext({ account: initialState?.account, chainId: initialState?.chainId })
    const { Others } = useWeb3State<'all'>(initialState?.pluginID)
    const fungibleAssets = useFungibleAssets<'all'>(initialState?.pluginID, undefined, {
        account,
        chainId,
    })
    const { value: fungibleTokens = EMPTY_LIST, loading } = useFungibleTokensFromTokenList(initialState?.pluginID, {
        chainId,
    })

    const assets = (fungibleAssets?.value ?? EMPTY_LIST).map((x) => {
        if (isNativeTokenAddress(x.address))
            return { ...x, logoURL: Others?.chainResolver.nativeCurrency(x.chainId)?.logoURL || x.logoURL }
        const token = fungibleTokens.find((y) => isSameAddress(x.address, y.address) && x.chainId === y.chainId)
        if (!token?.logoURL) return x
        return { ...x, logoURL: token.logoURL }
    })
    return {
        account,
        chainId,
        fungibleAssets: { ...fungibleAssets, value: assets, loading: loading || fungibleAssets.loading },
    }
}

export const Context = createContainer(useContext)
