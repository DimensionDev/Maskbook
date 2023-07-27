import { SelectGasSettingsToolbar, type SelectGasSettingsToolbarProps } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNativeTokenPrice, useWallet } from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { createNativeToken, isNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { memo, useMemo } from 'react'
import { useI18N } from '../../../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    label: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        fontWeight: 700,
    },
    settingBar: {
        width: '100%',
    },
}))

const ETH_GAS_LIMIT = 21000
const ERC20_GAS_LIMIT = 50000

interface Props extends Pick<SelectGasSettingsToolbarProps, 'gasConfig' | 'onChange'> {
    chainId: ChainId
    tokenAddress: string
}
export const GasSettings = memo<Props>(function GasSettings({ tokenAddress: address, chainId, gasConfig, onChange }) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const wallet = useWallet()
    const { data: smartPayChainId } = useQuery(['smart-pay', 'supported-chainId'], () =>
        SmartPayBundler.getSupportedChainId(),
    )
    const isNativeToken = isNativeTokenAddress(address)
    const gasLimit = isNativeToken ? ETH_GAS_LIMIT : ERC20_GAS_LIMIT
    const nativeToken = useMemo(() => createNativeToken(chainId), [chainId])
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })
    // const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    // const [gasOption, setGasOption] = useState<GasConfig>()
    //
    // const handleGasSettingChange = useCallback(
    //     (gasConfig: GasConfig) => {
    //         const editor = GasEditor.fromConfig(chainId, gasConfig)
    //         setGasOption((config) => {
    //             return editor.getGasConfig({
    //                 gasPrice: defaultGasPrice,
    //                 maxFeePerGas: defaultGasPrice,
    //                 maxPriorityFeePerGas: defaultGasPrice,
    //                 ...config,
    //             })
    //         })
    //     },
    //     [chainId, defaultGasPrice],
    // )
    return (
        <SelectGasSettingsToolbar
            className={classes.settingBar}
            supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
            nativeToken={nativeToken}
            nativeTokenPrice={nativeTokenPrice}
            gasConfig={gasConfig}
            gasLimit={gasLimit}
            onChange={onChange}
            classes={{ label: classes.label }}
        />
    )
})
