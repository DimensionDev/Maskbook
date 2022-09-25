import { useEffect, useState, useMemo, useCallback } from 'react'
import { FormattedBalance, useSharedI18N, useSelectAdvancedSettings, useGasSettingsMenu } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    NetworkPluginID,
    GasOptionType,
    multipliedBy,
    isZero,
    formatBalance,
    FungibleToken,
} from '@masknet/web3-shared-base'
import { formatGweiToWei, formatUSD, formatWeiToEther, GasOptionConfig } from '@masknet/web3-shared-evm'
import { Typography, Box } from '@mui/material'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainId, useCurrentWeb3NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import { Icons } from '@masknet/icons'
import { SettingsContext } from '../SettingsBoard/Context.js'
import BigNumber from 'bignumber.js'

interface SelectGasSettingsToolbarProps<T extends NetworkPluginID = NetworkPluginID> {
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    nativeToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    nativeTokenPrice: number
    gasLimit: number
    gasOption?: GasOptionConfig
    onChange?(gasOption?: GasOptionConfig): void
}

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 99,
            padding: '8px 12px',
            cursor: 'pointer',
        },
        section: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '16px 0',
            '& > p': {
                fontSize: 14,
                lineHeight: '18px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
            },
        },
        gasSection: {
            display: 'flex',
            fontSize: 14,
            lineHeight: '18px',
            fontWeight: 700,
            alignItems: 'center',
        },
        text: {
            fontSize: 14,
            lineHeight: '18px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            marginRight: 5,
        },
        title: {
            fontWeight: 700,
        },
        gasUSDPrice: {
            fontWeight: 700,
            margin: '0px 4px',
            fontSize: 14,
        },
    }
})

export function SelectGasSettingsToolbar(props: SelectGasSettingsToolbarProps) {
    const pluginID = useCurrentWeb3NetworkPluginID(props.pluginID)
    const chainId = useChainId(pluginID, props.chainId)

    return (
        <SettingsContext.Provider initialState={{ pluginID, chainId }}>
            <SelectGasSettingsToolbarUI {...props} />
        </SettingsContext.Provider>
    )
}

export function SelectGasSettingsToolbarUI({
    onChange,
    gasOption,
    gasLimit,
    nativeToken,
    nativeTokenPrice,
}: SelectGasSettingsToolbarProps) {
    const { gasOptions, GAS_OPTION_NAMES } = SettingsContext.useContainer()
    const t = useSharedI18N()
    const [isCustomGas, setIsCustomGas] = useState(false)
    const [currentGasOptionType, setCurrentGasOptionType] = useState<GasOptionType>(GasOptionType.SLOW)
    const { classes, theme } = useStyles()
    const chainId = useChainId()
    const { Others } = useWeb3State<'all'>()

    const selectAdvancedSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)

    const isSupportEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')
    const setGasConfigCallback = useCallback(
        (maxFeePerGas: string, maxPriorityFeePerGas: string, gasPrice: string) =>
            onChange?.(
                isSupportEIP1559
                    ? {
                          maxFeePerGas,
                          maxPriorityFeePerGas,
                      }
                    : {
                          gasPrice: new BigNumber(maxFeePerGas).gt(0) ? maxFeePerGas : gasPrice,
                      },
            ),
        [isSupportEIP1559, chainId, onChange],
    )

    const openCustomGasSettingsDialog = useCallback(async () => {
        setIsCustomGas(true)
        const { transaction } = await selectAdvancedSettings({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: true,
            transaction: gasOption,
        })

        if (!transaction) return

        setGasConfigCallback(
            transaction.maxFeePerGas as string,
            transaction.maxPriorityFeePerGas as string,
            transaction.gasPrice as string,
        )
    }, [chainId, gasOption, selectAdvancedSettings, setGasConfigCallback])

    const currentGasOption = gasOptions?.[currentGasOptionType]
    useEffect(() => {
        if (!currentGasOption || isCustomGas) return

        setGasConfigCallback(
            formatGweiToWei(currentGasOption.suggestedMaxFeePerGas).toString(),
            formatGweiToWei(currentGasOption.suggestedMaxPriorityFeePerGas).toString(),
            currentGasOption.suggestedMaxPriorityFeePerGas,
        )
    }, [currentGasOption, isCustomGas, setGasConfigCallback])

    const gasFee = useMemo(() => {
        if (!gasOption || !gasLimit) return '0'
        const gasPrice = (gasOption.gasPrice ? gasOption.gasPrice : gasOption.maxFeePerGas) as string
        return gasPrice ? multipliedBy(gasPrice, gasLimit).integerValue().toFixed() : '0'
    }, [gasLimit, gasOption])

    const gasFeeUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatUSD(formatWeiToEther(gasFee).times(nativeTokenPrice))
    }, [gasFee, nativeTokenPrice])

    const selectGasSettingsMenu = useGasSettingsMenu(NetworkPluginID.PLUGIN_EVM)

    return gasOptions && !isZero(gasFee) ? (
        <Box className={classes.section}>
            <Typography className={classes.title}>Gas fee</Typography>
            <div className={classes.gasSection}>
                <FormattedBalance
                    value={gasFee}
                    decimals={nativeToken.decimals ?? 0}
                    significant={4}
                    symbol={nativeToken.symbol}
                    formatter={formatBalance}
                />
                <Typography className={classes.gasUSDPrice}>{t.gas_usd_price({ usd: gasFeeUSD })}</Typography>
                <div
                    className={classes.root}
                    onClick={async (ev) => {
                        if (!gasOptions) return
                        const result = await selectGasSettingsMenu({
                            anchorEl: ev.currentTarget,
                            anchorSibling: false,
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'right',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                            },
                            PaperProps: {
                                style: { background: theme.palette.maskColor.bottom, transform: 'translateY(8px)' },
                            },
                            openCustomGasSettingsDialog,
                        })

                        if (!result) return
                        const { isCustomGas, type, transaction } = result

                        setIsCustomGas(isCustomGas)
                        setCurrentGasOptionType(type)
                        setGasConfigCallback(
                            transaction.maxFeePerGas as string,
                            transaction.maxPriorityFeePerGas as string,
                            transaction.gasPrice as string,
                        )
                    }}>
                    <Typography className={classes.text}>
                        {isCustomGas ? t.gas_settings_custom() : GAS_OPTION_NAMES[currentGasOptionType]}
                    </Typography>
                    <Icons.Candle width={12} height={12} />
                </div>
            </div>
        </Box>
    ) : null
}
