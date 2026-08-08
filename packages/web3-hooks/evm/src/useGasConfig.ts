import { useState, type Dispatch, type SetStateAction } from 'react'
import { GasEditor, type ChainId, type GasConfig, type GasOption } from '@masknet/web3-shared-evm'
import { useGasOptions } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasOptionType } from '@masknet/web3-shared-base'

export function useGasConfig(
    chainId: Web3Helper.ChainIdAll,
    defaultGasConfig?: GasConfig,
): {
    gasPrice: string
    gasConfig: GasConfig
    setGasConfig: Dispatch<SetStateAction<GasConfig | undefined>>
    gasOptions: Record<GasOptionType, GasOption> | null | undefined
    isLoadingGasOptions: boolean
} {
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
