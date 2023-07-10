import { useCallback, useMemo } from 'react'
import { SelectGasSettingsToolbar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useGasPrice, useNativeTokenPrice, useWallet } from '@masknet/web3-hooks-base'
import { createNativeToken, type GasConfig, isNativeTokenAddress, GasEditor } from '@masknet/web3-shared-evm'
import { useGasLimit } from './useGasLimit.js'
import { useTip } from '../../contexts/index.js'
import { SmartPayBundler } from '@masknet/web3-providers'
import { useAsync } from 'react-use'

const ETH_GAS_LIMIT = 21000
const ERC20_GAS_LIMIT = 50000

export function GasSettingsBar() {
    const wallet = useWallet()
    const { token, setGasOption, gasOption } = useTip()
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    const isNativeToken = isNativeTokenAddress(token?.address)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const nativeToken = useMemo(() => createNativeToken(chainId), [chainId])
    const GAS_LIMIT = isNativeToken ? ETH_GAS_LIMIT : ERC20_GAS_LIMIT
    const { value: gasLimit = GAS_LIMIT } = useGasLimit()

    const handleGasSettingChange = useCallback(
        (gasConfig: GasConfig) => {
            const editor = GasEditor.fromConfig(chainId, gasConfig)
            setGasOption((config) => {
                return editor.getGasConfig({
                    gasPrice: defaultGasPrice,
                    maxFeePerGas: defaultGasPrice,
                    maxPriorityFeePerGas: defaultGasPrice,
                    ...config,
                })
            })
        },
        [chainId, defaultGasPrice],
    )
    return (
        <SelectGasSettingsToolbar
            supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
            nativeToken={nativeToken}
            nativeTokenPrice={nativeTokenPrice}
            gasConfig={gasOption}
            gasLimit={gasLimit}
            onChange={handleGasSettingChange}
        />
    )
}
