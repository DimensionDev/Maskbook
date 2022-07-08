/// <reference types="@masknet/web3-shared-flow/env" />
/// <reference types="@masknet/web3-shared-solana/env" />

import { useCallback, useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useSharedI18N } from '@masknet/shared'
import {
    useGasOptions,
    useCurrentWeb3NetworkPluginID,
    Web3Helper,
    useChainId,
    useSingleBlockBeatRetry,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import { GasSettingsType } from './types'

const DEFAULT_SLIPPAGE_TOLERANCE = 0.5
const DEFAULT_SLIPPAGE_TOLERANCES = [0.5, 1, 2, 5]

const IN_MEMORY_CACHE: {
    lastNetworkSignature?: string
    lastTransactionSignature?: string
    lastSelectedGasOptionType: GasOptionType
    lastSelectedGasSettingsType: GasSettingsType
} = {
    lastSelectedGasOptionType: GasOptionType.NORMAL,
    lastSelectedGasSettingsType: GasSettingsType.Basic,
}

export function useSettingsContext(initial?: {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    slippageTolerance?: number
    transaction?: Web3Helper.TransactionAll
    disableGasPrice?: boolean
    disableGasLimit?: boolean
    disableSlippageTolerance?: boolean
}) {
    const t = useSharedI18N()
    const pluginID = useCurrentWeb3NetworkPluginID(initial?.pluginID)
    const chainId = useChainId(pluginID, initial?.chainId)
    const { Others } = useWeb3State<'all'>(pluginID)
    const [transactionOptions, setTransactionOptions] = useState<Partial<Web3Helper.TransactionAll> | null>(
        initial?.transaction ?? null,
    )
    const [slippageTolerance, setSlippageTolerance] = useState(initial?.slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE)

    const networkSignature = `${pluginID}_${chainId}`
    const transactionSignature = Others?.getTransactionSignature(chainId, transactionOptions ?? undefined) ?? ''
    const needToResetByNetwork =
        !!IN_MEMORY_CACHE?.lastNetworkSignature && IN_MEMORY_CACHE.lastNetworkSignature !== networkSignature
    const needToResetByTransaction =
        !!IN_MEMORY_CACHE?.lastTransactionSignature && IN_MEMORY_CACHE.lastTransactionSignature !== transactionSignature
    const [gasSettingsType, setGasSettingsType] = useState<GasSettingsType>(
        needToResetByNetwork || needToResetByTransaction
            ? GasSettingsType.Basic
            : IN_MEMORY_CACHE.lastSelectedGasSettingsType,
    )
    const [gasOptionType, setGasOptionType] = useState<GasOptionType>(
        needToResetByNetwork || needToResetByTransaction
            ? GasOptionType.NORMAL
            : IN_MEMORY_CACHE.lastSelectedGasOptionType,
    )

    const {
        value: gasOptions,
        loading: gasOptionsLoading,
        error: gasOptionsError,
        retry: gasOptionRetry,
    } = useGasOptions<'all'>(pluginID, {
        chainId,
    })

    const onClearInMemoryCache = useCallback(() => {
        delete IN_MEMORY_CACHE.lastNetworkSignature
        delete IN_MEMORY_CACHE.lastTransactionSignature
        IN_MEMORY_CACHE.lastSelectedGasOptionType = GasOptionType.NORMAL
        IN_MEMORY_CACHE.lastSelectedGasSettingsType = GasSettingsType.Basic
    }, [])

    const onResetAll = useCallback(() => {
        setSlippageTolerance(1)
        setGasOptionType(GasOptionType.NORMAL)
        setTransactionOptions(null)
        gasOptionRetry()
        onClearInMemoryCache()
    }, [gasOptionRetry, onClearInMemoryCache])

    useSingleBlockBeatRetry(pluginID, async () => {
        if (initial?.disableGasPrice) return
        gasOptionRetry()
    })

    // sync in-memory cache
    useEffect(() => {
        IN_MEMORY_CACHE.lastNetworkSignature = networkSignature
        IN_MEMORY_CACHE.lastTransactionSignature = transactionSignature
        IN_MEMORY_CACHE.lastSelectedGasOptionType = gasOptionType
        IN_MEMORY_CACHE.lastSelectedGasSettingsType = gasSettingsType
    }, [gasOptionType, gasSettingsType, networkSignature, transactionSignature])

    return {
        DEFAULT_SLIPPAGE_TOLERANCE,
        DEFAULT_SLIPPAGE_TOLERANCES,
        GAS_OPTION_NAMES: {
            [GasOptionType.FAST]: t.gas_settings_gas_option_type_fast(),
            [GasOptionType.NORMAL]: t.gas_settings_gas_option_type_normal(),
            [GasOptionType.SLOW]: t.gas_settings_gas_option_type_slow(),
        },

        pluginID,
        chainId,
        transaction: initial?.transaction,

        transactionOptions,
        setTransactionOptions,

        slippageTolerance,
        setSlippageTolerance,

        gasOptionType,
        setGasOptionType,

        gasSettingsType,
        setGasSettingsType,

        gasOptions,
        gasOptionsLoading,
        gasOptionsError,
        gasOptionRetry,

        resetAll: onResetAll,
    }
}

export const SettingsContext = createContainer(useSettingsContext)
