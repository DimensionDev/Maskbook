import { useGasPrice, useNativeTokenPrice, useWeb3State } from '@masknet/web3-hooks-base'
import { SelectGasSettingsToolbar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    createNativeToken,
    EIP1559GasConfig,
    GasOptionConfig,
    isNativeTokenAddress,
    PriorEIP1559GasConfig,
} from '@masknet/web3-shared-evm'
import { useCallback, useMemo } from 'react'
import { TargetRuntimeContext, useTip } from '../../contexts'
import { useGasLimit } from './useGasLimit'

const ETH_GAS_LIMIT = 21000
const ERC20_GAS_LIMIT = 50000
export function GasSettingsBar() {
    const { token, setGasOption, gasOption } = useTip()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const isNativeToken = isNativeTokenAddress(token?.address)
    const { targetChainId: chainId } = TargetRuntimeContext.useContainer()
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const nativeToken = useMemo(() => createNativeToken(chainId), [chainId])
    const isSupportEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')
    const GAS_LIMIT = isNativeToken ? ETH_GAS_LIMIT : ERC20_GAS_LIMIT
    const { value: gasLimit = GAS_LIMIT } = useGasLimit()

    const handleGasSettingChange = useCallback(
        (tx: GasOptionConfig) => {
            setGasOption((config) => {
                if (isSupportEIP1559)
                    return {
                        ...config,
                        gasPrice: undefined,
                        maxFeePerGas:
                            (tx.maxFeePerGas as string) ||
                            (config as EIP1559GasConfig)?.maxFeePerGas ||
                            defaultGasPrice,
                        maxPriorityFeePerGas:
                            (tx.maxPriorityFeePerGas as string) ||
                            (config as EIP1559GasConfig)?.maxPriorityFeePerGas ||
                            '1',
                    }
                return {
                    ...config,
                    gasPrice: (tx.gasPrice as string) || (config as PriorEIP1559GasConfig)?.gasPrice || defaultGasPrice,
                    maxFeePerGas: undefined,
                    maxPriorityFeePerGas: undefined,
                }
            })
        },
        [isSupportEIP1559, defaultGasPrice],
    )
    return (
        <SelectGasSettingsToolbar
            nativeToken={nativeToken}
            nativeTokenPrice={nativeTokenPrice}
            gasOption={gasOption}
            gasLimit={gasLimit}
            onChange={handleGasSettingChange}
        />
    )
}
