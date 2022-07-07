/// <reference types="@masknet/web3-shared-flow/env" />
/// <reference types="@masknet/web3-shared-solana/env" />

import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useSharedI18N } from '@masknet/shared'
import {
    useGasOptions,
    useCurrentWeb3NetworkPluginID,
    Web3Helper,
    useChainId,
    useSingleBlockBeatRetry,
} from '@masknet/plugin-infra/web3'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'

const DEFAULT_SLIPPAGE_TOLERANCE = 0.5
const DEFAULT_SLIPPAGE_TOLERANCES = [0.5, 1, 2, 5]

export function useSettingsContext(initial?: {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    slippageTolerance?: number
    transaction?: Web3Helper.TransactionAll
    disableGasPrice?: boolean
    disableSlippageTolerance?: boolean
}) {
    const t = useSharedI18N()
    const pluginID = useCurrentWeb3NetworkPluginID(initial?.pluginID)
    const chainId = useChainId(pluginID, initial?.chainId)
    const [transactionOptions, setTransactionOptions] = useState<Partial<Web3Helper.TransactionAll> | null>(null)
    const [slippageTolerance, setSlippageTolerance] = useState(initial?.slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE)
    const [gasOptionType, setGasOptionType] = useState<GasOptionType>()

    const {
        value: gasOptions,
        loading: gasOptionsLoading,
        error: gasOptionsError,
        retry: gasOptionRetry,
    } = useGasOptions<'all'>(pluginID, {
        chainId,
    })

    const onResetAll = useCallback(() => {
        setSlippageTolerance(1)
        setGasOptionType(GasOptionType.NORMAL)
        setTransactionOptions(null)
        gasOptionRetry()
    }, [gasOptionRetry])

    useSingleBlockBeatRetry(pluginID, async () => {
        if (initial?.disableGasPrice) return
        gasOptionRetry()
    })

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

        gasOptions,
        gasOptionsLoading,
        gasOptionsError,
        gasOptionRetry,

        resetAll: onResetAll,
    }
}

export const SettingsContext = createContainer(useSettingsContext)
