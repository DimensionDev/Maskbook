import { createContainer } from 'unstated-next'
import { type NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import {
    useFungibleAssets,
    useChainContext,
    useFungibleTokensFromTokenList,
    useWeb3Others,
    useTransactions,
    useIterator,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { isSameAddress, type Transaction } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'

function useContext(initialState?: { account?: string; chainId?: Web3Helper.ChainIdAll; pluginID?: NetworkPluginID }) {
    const { account, chainId } = useChainContext({ account: initialState?.account, chainId: initialState?.chainId })
    const Others = useWeb3Others(initialState?.pluginID)
    const fungibleAssets = useFungibleAssets<'all'>(initialState?.pluginID, undefined, {
        account,
        chainId,
    })
    const { value: fungibleTokens = EMPTY_LIST, loading } = useFungibleTokensFromTokenList(initialState?.pluginID, {
        chainId,
    })

    const assets = useMemo(() => {
        if (!fungibleAssets?.data) return EMPTY_LIST
        return fungibleAssets.data.map((x) => {
            if (isNativeTokenAddress(x.address))
                return { ...x, logoURL: Others.chainResolver.nativeCurrency(x.chainId)?.logoURL || x.logoURL }
            const token = fungibleTokens.find((y) => isSameAddress(x.address, y.address) && x.chainId === y.chainId)
            if (!token?.logoURL) return x
            return { ...x, logoURL: token.logoURL }
        })
    }, [fungibleAssets.data, fungibleTokens, Others.chainResolver.nativeCurrency])

    const total = useMemo(() => {
        let v = new BigNumber(0)
        assets.map((asset) => {
            v = new BigNumber(asset.value?.usd ?? 0).plus(v)
        })
        return v.toFixed(2)
    }, [assets])

    const iterator = useTransactions(initialState?.pluginID, { chainId })
    const {
        value = EMPTY_LIST,
        next,
        done,
        loading: loadingHistory,
    } = useIterator<Transaction<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>(iterator)

    const dataSource = useMemo(() => {
        return value.filter((x) => x.chainId === chainId)
    }, [value, chainId])

    return {
        account,
        chainId,
        fungibleAssets: { ...fungibleAssets, value: assets, loading: loading || fungibleAssets.isLoading },
        next,
        done,
        history: { value: dataSource, loading: loadingHistory },
        total,
    }
}

export const Context = createContainer(useContext)
