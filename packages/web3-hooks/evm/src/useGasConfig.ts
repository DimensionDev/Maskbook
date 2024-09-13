import { useState } from 'react'
import { GasEditor, type ChainId, type GasConfig } from '@masknet/web3-shared-evm'
import { useGasOptions } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'

export function useGasConfig(chainId: Web3Helper.ChainIdAll, defaultGasConfig?: GasConfig) {
    const [gasConfig, setGasConfig] = useState<GasConfig | undefined>(defaultGasConfig)
    const { data: gasOptions, isLoading: isLoadingGasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, {
        chainId: chainId as ChainId,
    })

    const editor = GasEditor.fromGasOptions(chainId as ChainId, gasOptions)

    return {
        gasPrice: editor.getGasPrice(),
        gasConfig: gasConfig || editor.getGasConfig(),
        setGasConfig,
        gasOptions,
        isLoadingGasOptions,
    }
}
