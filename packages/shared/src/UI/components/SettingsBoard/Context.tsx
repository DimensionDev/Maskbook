/// <reference types="@masknet/web3-shared-flow/env" />

import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { useSharedI18N } from '@masknet/shared'
import { useCurrentWeb3NetworkPluginID, useGasOptions, Web3Helper } from '@masknet/plugin-infra/web3'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'

export function useSettingsContext(initial?: { pluginID?: NetworkPluginID; chainId?: Web3Helper.ChainIdAll }) {
    const t = useSharedI18N()
    const pluginID = useCurrentWeb3NetworkPluginID(initial?.pluginID)
    const [chainId] = useState(initial?.chainId)
    const [slippageTolerance, setSlippageTolerance] = useState(1)
    const [gasOptionType, setGasOptionType] = useState(GasOptionType.NORMAL)
    const [gasPrice, setGasPrice] = useState(0)
    const [gasLimit, setGasLimit] = useState(0)
    const [maxPriorityFee, setMaxPriorityFee] = useState(0)
    const [maxFee, setMaxFee] = useState(0)
    const { value: gasOptions, loading: gasOptionsLoading, error: gasOptionsError } = useGasOptions<'all'>()

    return {
        DEFAULT_SLIPPAGE_TOLERANCES: [0.5, 1, 2, 5],
        GAS_OPTION_NAMES: {
            [GasOptionType.FAST]: t.gas_settings_gas_option_type_fast(),
            [GasOptionType.NORMAL]: t.gas_settings_gas_option_type_normal(),
            [GasOptionType.SLOW]: t.gas_settings_gas_option_type_slow(),
        },

        pluginID,
        chainId,

        gasOptions,
        gasOptionsLoading,
        gasOptionsError,

        gasOptionType,
        setGasOptionType,

        gasPrice,
        setGasPrice,

        gasLimit,
        setGasLimit,

        maxPriorityFee,
        setMaxPriorityFee,

        maxFee,
        setMaxFee,

        slippageTolerance,
        setSlippageTolerance,
    }
}

export const SettingsContext = createContainer(useSettingsContext)
