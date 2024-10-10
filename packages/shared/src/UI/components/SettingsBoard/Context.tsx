import { useCallback, useEffect, useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'
import { useGasOptions, useNetworkContext, useChainContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { GasSettingsType } from './types/index.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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

function useSettingsContext(initial?: {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    slippageTolerance?: number
    transaction?: Web3Helper.TransactionAll
    disableGasPrice?: boolean
    disableGasLimit?: boolean
    disableSlippageTolerance?: boolean
}) {
    const { _ } = useLingui()
    const { pluginID } = useNetworkContext(initial?.pluginID)
    const { chainId } = useChainContext({
        chainId: initial?.chainId,
    })
    const Utils = useWeb3Utils(pluginID)
    const [transactionOptions, setTransactionOptions] = useState<
        Web3Helper.Definition[typeof pluginID]['Transaction'] | undefined
    >(initial?.transaction)
    const [slippageTolerance, setSlippageTolerance] = useState(initial?.slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE)

    const networkSignature = `${pluginID}_${chainId}`
    const transactionSignature = Utils.getTransactionSignature!(chainId, transactionOptions) ?? ''
    const needToResetByNetwork =
        !!IN_MEMORY_CACHE.lastNetworkSignature && IN_MEMORY_CACHE.lastNetworkSignature !== networkSignature
    const needToResetByTransaction =
        !!IN_MEMORY_CACHE.lastTransactionSignature && IN_MEMORY_CACHE.lastTransactionSignature !== transactionSignature
    const [gasSettingsType, setGasSettingsType] = useState<GasSettingsType>(
        needToResetByNetwork || needToResetByTransaction ?
            GasSettingsType.Basic
        :   IN_MEMORY_CACHE.lastSelectedGasSettingsType,
    )
    const [gasOptionType, setGasOptionType] = useState<GasOptionType>(
        needToResetByNetwork || needToResetByTransaction ?
            GasOptionType.NORMAL
        :   IN_MEMORY_CACHE.lastSelectedGasOptionType,
    )

    const {
        data: gasOptions,
        isPending: gasOptionsLoading,
        error: gasOptionsError,
        refetch: gasOptionRetry,
    } = useGasOptions(pluginID, { chainId })

    const onClearInMemoryCache = useCallback(() => {
        delete IN_MEMORY_CACHE.lastNetworkSignature
        delete IN_MEMORY_CACHE.lastTransactionSignature
        IN_MEMORY_CACHE.lastSelectedGasOptionType = GasOptionType.NORMAL
        IN_MEMORY_CACHE.lastSelectedGasSettingsType = GasSettingsType.Basic
    }, [])

    const onResetAll = useCallback(() => {
        setSlippageTolerance(1)
        setGasOptionType(GasOptionType.NORMAL)
        setTransactionOptions(undefined)
        gasOptionRetry()
        onClearInMemoryCache()
    }, [gasOptionRetry, onClearInMemoryCache])

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
            [GasOptionType.FAST]: _(msg`Instant`),
            [GasOptionType.NORMAL]: _(msg`High`),
            [GasOptionType.SLOW]: _(msg`Medium`),
            [GasOptionType.CUSTOM]: '',
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
        gasOptionRetry: () => {
            gasOptionRetry()
        },

        resetAll: onResetAll,
    }
}

export const SettingsContext = createContainer(useSettingsContext)
