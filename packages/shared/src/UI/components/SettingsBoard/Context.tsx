/// <reference types="@masknet/web3-shared-flow/env" />
/// <reference types="@masknet/web3-shared-solana/env" />

import { useCallback, useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useSharedI18N } from '@masknet/shared'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { useCurrentWeb3NetworkPluginID, useGasOptions } from '@masknet/plugin-infra/web3'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Transaction } from '@masknet/web3-shared-evm'
import { useCallbackOnce } from './hooks/useCallbackOnce'

export function useSettingsContext(initial?: {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    transaction?: Web3Helper.TransactionAll
}) {
    const t = useSharedI18N()
    const pluginID = useCurrentWeb3NetworkPluginID(initial?.pluginID)
    const [chainId] = useState(initial?.chainId)
    const [transaction] = useState(initial?.transaction)
    const [slippageTolerance, setSlippageTolerance] = useState(1)
    const [gasOptionType, setGasOptionType] = useState(GasOptionType.NORMAL)
    const [gasOption, setGasOption] = useState<Web3Helper.GasOptionAll | null>(null)
    const {
        value: gasOptions,
        loading: gasOptionsLoading,
        error: gasOptionsError,
        retry: gasOptionRetry,
    } = useGasOptions<'all'>()

    const setGasOptionOnce = useCallbackOnce((gasOptions: Record<GasOptionType, Web3Helper.GasOptionAll>) => {
        setGasOption(gasOptions[GasOptionType.NORMAL])
    }, [])

    useEffect(() => {
        if (!gasOptions || gasOption) return
        setGasOptionOnce(gasOptions)
    }, [gasOption, gasOptions])

    const onResetAll = useCallback(() => {
        setSlippageTolerance(1)
        setGasOptionType(GasOptionType.NORMAL)
        setGasOption(null)
        gasOptionRetry()
    }, [gasOptionRetry])

    return {
        DEFAULT_SLIPPAGE_TOLERANCES: [0.5, 1, 2, 5],
        GAS_OPTION_NAMES: {
            [GasOptionType.FAST]: t.gas_settings_gas_option_type_fast(),
            [GasOptionType.NORMAL]: t.gas_settings_gas_option_type_normal(),
            [GasOptionType.SLOW]: t.gas_settings_gas_option_type_slow(),
        },

        pluginID,
        chainId,
        transaction:
            pluginID === NetworkPluginID.PLUGIN_EVM
                ? {
                      ...(transaction as Transaction),
                      ...gasOption,
                  }
                : transaction,

        gasOption,
        setGasOption,

        slippageTolerance,
        setSlippageTolerance,

        gasOptionType,
        setGasOptionType,

        gasOptions,
        gasOptionsLoading,
        gasOptionsError,

        resetAll: onResetAll,
    }
}

export const SettingsContext = createContainer(useSettingsContext)
