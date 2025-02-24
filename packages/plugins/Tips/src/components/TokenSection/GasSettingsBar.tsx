import { useCallback } from 'react'
import { SelectGasSettingsToolbar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useGasPrice,
    useNativeTokenPrice,
    useNetwork,
    useSmartPayChainId,
    useWallet,
} from '@masknet/web3-hooks-base'
import { type GasConfig, isNativeTokenAddress, GasEditor } from '@masknet/web3-shared-evm'
import { useGasLimit } from './useGasLimit.js'
import { useTip } from '../../contexts/index.js'

const ETH_GAS_LIMIT = 21000
const ERC20_GAS_LIMIT = 50000

export function GasSettingsBar() {
    const wallet = useWallet()
    const { token, setGasOption, gasOption } = useTip()
    const smartPayChainId = useSmartPayChainId()

    const isNativeToken = isNativeTokenAddress(token?.address)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    const [defaultGasPrice = '1'] = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const network = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
    const nativeToken = network?.nativeCurrency
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
            nativeToken={nativeToken!}
            nativeTokenPrice={nativeTokenPrice}
            gasConfig={gasOption}
            gasLimit={gasLimit}
            onChange={handleGasSettingChange}
        />
    )
}
