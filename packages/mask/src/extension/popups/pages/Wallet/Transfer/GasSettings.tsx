import { SelectGasSettingsToolbar, type SelectGasSettingsToolbarProps } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNativeTokenPrice, useWallet } from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { createNativeToken, isNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { memo, useCallback, useMemo } from 'react'
import { GasSettingModal } from '../../../modals/modals.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        borderRadius: 16,
    },
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

    const handleOpenCustom = useCallback(async () => {
        const settings = await GasSettingModal.openAndWaitForClose({
            chainId,
            config: { gas: gasLimit.toString() },
        })
        if (settings) onChange?.(settings)
    }, [gasLimit])
    return (
        <SelectGasSettingsToolbar
            chainId={chainId}
            className={classes.settingBar}
            supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
            nativeToken={nativeToken}
            nativeTokenPrice={nativeTokenPrice}
            gasConfig={gasConfig}
            gasLimit={gasLimit}
            classes={{ label: classes.label }}
            onOpenCustomSetting={handleOpenCustom}
            onChange={onChange}
            MenuProps={{
                PaperProps: {
                    className: classes.paper,
                },
            }}
        />
    )
})
