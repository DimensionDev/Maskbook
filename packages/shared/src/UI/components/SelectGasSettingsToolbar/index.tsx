import { useEffect, useState, useMemo, useCallback } from 'react'
import { useMenuConfig, FormattedBalance, useSharedI18N, useSelectAdvancedSettings } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    NetworkPluginID,
    GasOptionType,
    multipliedBy,
    isZero,
    formatBalance,
    FungibleToken,
} from '@masknet/web3-shared-base'
import { formatEtherToGwei, formatGweiToWei, Transaction, formatUSD, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Typography, MenuItem, Box } from '@mui/material'
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
    transaction?: Transaction
    onChange?(transaction?: Transaction): void
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
        menuItem: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: '0px 12px',
            padding: theme.spacing(1, 0),
            width: 158,
            '&:hover': {
                background: 'none',
            },
        },
        title: {
            fontWeight: 700,
        },
        estimateGas: {
            color: theme.palette.text.third,
        },
        menuItemBorder: {
            borderBottom: `1px solid ${theme.palette.divider}`,
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
    transaction: gasConfig,
    nativeToken,
    nativeTokenPrice,
}: SelectGasSettingsToolbarProps) {
    const { gasOptions, GAS_OPTION_NAMES } = SettingsContext.useContainer()
    const t = useSharedI18N()
    const [isCustomGas, setIsCustomGas] = useState(false)
    const [currentGasOptionType, setCurrentGasOptionType] = useState<GasOptionType>(GasOptionType.SLOW)
    const { classes, cx, theme } = useStyles()
    const chainId = useChainId()
    const { Others } = useWeb3State<'all'>()

    const selectAdvancedSettings = useSelectAdvancedSettings(NetworkPluginID.PLUGIN_EVM)

    const setGasConfigCallback = useCallback(
        (maxFeePerGas: string, maxPriorityFeePerGas: string, gasPrice: string) =>
            onChange?.(
                Others?.chainResolver.isSupport(chainId, 'EIP1559')
                    ? {
                          maxFeePerGas,
                          maxPriorityFeePerGas,
                      }
                    : {
                          gasPrice: new BigNumber(maxFeePerGas).gt(0) ? maxFeePerGas : gasPrice,
                      },
            ),
        [chainId],
    )

    const openCustomGasSettingsDialog = useCallback(async () => {
        setIsCustomGas(true)
        const { transaction } = await selectAdvancedSettings({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: true,
            transaction: gasConfig,
        })

        if (!transaction) return

        setGasConfigCallback(
            transaction.maxFeePerGas as string,
            transaction.maxPriorityFeePerGas as string,
            transaction.gasPrice as string,
        )
    }, [chainId, gasConfig])

    useEffect(() => {
        if (!gasOptions?.[currentGasOptionType] || isCustomGas) return

        setGasConfigCallback(
            formatGweiToWei(gasOptions[currentGasOptionType].suggestedMaxFeePerGas).toString(),
            formatGweiToWei(gasOptions[currentGasOptionType].suggestedMaxFeePerGas).toString(),
            gasOptions[currentGasOptionType].suggestedMaxPriorityFeePerGas,
        )
    }, [currentGasOptionType, gasOptions, isCustomGas])

    const [menu, openMenu] = useMenuConfig(
        Object.entries(gasOptions ?? {})
            .reverse()
            .map(([type, option], i) => (
                <MenuItem
                    key={i}
                    className={cx(classes.menuItem, classes.menuItemBorder)}
                    onClick={() => {
                        setIsCustomGas(false)
                        setCurrentGasOptionType(type as GasOptionType)
                    }}>
                    <Typography className={classes.title}>{GAS_OPTION_NAMES[type as GasOptionType]}</Typography>
                    <Typography className={classes.estimateGas}>
                        {new BigNumber(option.suggestedMaxFeePerGas).gt(0)
                            ? `${new BigNumber(option.suggestedMaxFeePerGas).toFixed(2)}Gwei`
                            : new BigNumber(option.estimatedBaseFee ?? 0).gt(0)
                            ? `${formatEtherToGwei(option.estimatedBaseFee!).toFixed(2)}Gwei`
                            : ''}
                    </Typography>
                </MenuItem>
            ))
            .concat(
                <MenuItem className={cx(classes.menuItem)} onClick={openCustomGasSettingsDialog}>
                    <Typography className={classes.title}>{t.gas_settings_custom()}</Typography>
                </MenuItem>,
            ),
        {
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
        },
    )
    const gasFee = useMemo(() => {
        const gasPrice = gasConfig?.gasPrice ? gasConfig?.gasPrice : (gasConfig?.maxFeePerGas as string)
        return gasConfig?.gas && gasPrice
            ? multipliedBy(gasPrice as string, gasConfig.gas)
                  .integerValue()
                  .toFixed()
            : '0'
    }, [gasConfig])

    const gasFeeUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatUSD(formatWeiToEther(gasFee).times(nativeTokenPrice))
    }, [gasFee, nativeTokenPrice])

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
                <div className={classes.root} onClick={gasOptions ? openMenu : undefined}>
                    <Typography className={classes.text}>
                        {isCustomGas ? t.gas_settings_custom() : GAS_OPTION_NAMES[currentGasOptionType]}
                    </Typography>
                    <Icons.Candle width={12} height={12} />
                </div>
                {menu}
            </div>
        </Box>
    ) : null
}
