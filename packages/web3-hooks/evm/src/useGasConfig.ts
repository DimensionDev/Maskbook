import { useState } from 'react'
import { GasEditor, ChainId, GasConfig } from '@masknet/web3-shared-evm'
import { useGasOptions } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useGasConfig(chainId: Web3Helper.ChainIdAll) {
    const [gasConfig, setGasConfig] = useState<GasConfig | undefined>()
    const { value: gasOptions } = useGasOptions()

    const editor = GasEditor.fromGasOptions(chainId as ChainId, gasOptions)

    return {
        gasPrice: editor.getGasPrice(),
        gasConfig: gasConfig || editor.getGasConfig(),
        setGasConfig,
    }
}
