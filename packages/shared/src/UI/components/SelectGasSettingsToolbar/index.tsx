import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAsync } from 'react-use'
import { BigNumber } from 'bignumber.js'
import {
    useMenuConfig,
    FormattedBalance,
    useSharedI18N,
    useSelectAdvancedSettings,
    ApproveMaskDialog,
} from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    GasOptionType,
    isZero,
    formatBalance,
    formatCurrency,
    isSameAddress,
    ZERO,
    toFixed,
} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    type ChainId,
    DepositPaymaster,
    formatEtherToGwei,
    formatWeiToEther,
    formatWeiToGwei,
    type GasConfig,
    GasEditor,
} from '@masknet/web3-shared-evm'
import { Typography, MenuItem, Box } from '@mui/material'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useWeb3State,
    useNetworkContext,
    useFungibleToken,
    useFungibleTokenPrice,
} from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
import { SmartPayBundler } from '@masknet/web3-providers'
import { SettingsContext } from '../SettingsBoard/Context.js'
import { useGasCurrencyMenu } from '../../../hooks/useGasCurrencyMenu.js'

interface SelectGasSettingsToolbarProps<T extends NetworkPluginID = NetworkPluginID> {
    pluginID?: T
    chainId?: Web3Helper.ChainIdAll
    nativeToken: Web3Helper.FungibleTokenAll
    nativeTokenPrice: number
    gasLimit: number
    gasConfig?: GasConfig
    onChange?(gasConfig?: GasConfig): void
    supportMultiCurrency?: boolean
}

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 99,
            width: 93,
            height: 26,
            cursor: 'pointer',
            justifyContent: 'center',
            marginLeft: 6,
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
            lineHeight: '18px',
            fontWeight: 700,
            alignItems: 'center',
        },
        text: {
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
        },
    }
})

export function SelectGasSettingsToolbar(props: SelectGasSettingsToolbarProps) {
    const { pluginID } = useNetworkContext(props.pluginID)
    const { chainId } = useChainContext({ chainId: props.chainId })

    return (
        <SettingsContext.Provider initialState={{ pluginID, chainId }}>
            <SelectGasSettingsToolbarUI {...props} />
        </SettingsContext.Provider>
    )
}

export function SelectGasSettingsToolbarUI({
    onChange,
    gasConfig: gasOption,
    gasLimit,
    nativeToken,
    nativeTokenPrice,
    supportMultiCurrency,
}: SelectGasSettingsToolbarProps) {
    const t = useSharedI18N()
    const { classes, cx, theme } = useStyles()
    const { gasOptions, GAS_OPTION_NAMES } = SettingsContext.useContainer()

    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [isCustomGas, setIsCustomGas] = useState(false)
    const [currentGasOptionType, setCurrentGasOptionType] = useState<GasOptionType>(GasOptionType.NORMAL)
    const [currentGasCurrency, setCurrentGasCurrency] = useState(gasOption?.gasCurrency)
    const { chainId } = useChainContext()
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
                          gasCurrency: currentGasCurrency,
                          gas: new BigNumber(gasLimit).toString(),
                      }
                    : {
                          gasPrice: new BigNumber(maxFeePerGas).gt(0) ? maxFeePerGas : gasPrice,
                          gasCurrency: currentGasCurrency,
                          gas: new BigNumber(gasLimit).toString(),
                      },
            ),
        [isSupportEIP1559, chainId, onChange, currentGasCurrency, gasLimit],
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

        setGasConfigCallback(transaction.maxFeePerGas!, transaction.maxPriorityFeePerGas!, transaction.gasPrice!)
    }, [chainId, gasOption, selectAdvancedSettings, setGasConfigCallback])

    const currentGasOption = gasOptions?.[currentGasOptionType]
    useEffect(() => {
        if (!currentGasOption || isCustomGas) return

        setGasConfigCallback(
            currentGasOption.suggestedMaxFeePerGas,
            currentGasOption.suggestedMaxPriorityFeePerGas,
            currentGasOption.suggestedMaxPriorityFeePerGas,
        )
    }, [currentGasOption, isCustomGas, setGasConfigCallback])

    const { value: currencyRatio } = useAsync(async () => {
        const chainId = await SmartPayBundler.getSupportedChainId()
        const depositPaymaster = new DepositPaymaster(chainId)
        const ratio = await depositPaymaster.getRatio()

        return ratio
    }, [])

    const [menu, openMenu] = useMenuConfig(
        Object.entries(gasOptions ?? {})
            .reverse()
            .map(([type, option]) => (
                <MenuItem
                    key={type}
                    className={cx(classes.menuItem, classes.menuItemBorder)}
                    onClick={() => {
                        setIsCustomGas(false)
                        setCurrentGasOptionType(type as GasOptionType)
                    }}>
                    <Typography className={classes.title}>{GAS_OPTION_NAMES[type as GasOptionType]}</Typography>
                    <Typography className={classes.estimateGas}>
                        {!isZero(option.suggestedMaxFeePerGas)
                            ? `${formatWeiToGwei(option.suggestedMaxFeePerGas).toFixed(2)} Gwei`
                            : !isZero(option.estimatedBaseFee ?? 0)
                            ? `${formatEtherToGwei(option.estimatedBaseFee!).toFixed(2)} Gwei`
                            : ''}
                    </Typography>
                </MenuItem>
            ))
            .concat(
                <MenuItem key="setting" className={cx(classes.menuItem)} onClick={openCustomGasSettingsDialog}>
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

    const [currencyMenu, openCurrencyMenu] = useGasCurrencyMenu(
        NetworkPluginID.PLUGIN_EVM,
        (address) => setCurrentGasCurrency(address),
        currentGasCurrency,
        undefined,
        () => setApproveDialogOpen(true),
    )

    const { value: currencyToken } = useFungibleToken(undefined, currentGasCurrency, nativeToken, { chainId })
    const { value: currencyTokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, currentGasCurrency)

    const gasFee = useMemo(() => {
        if (!gasOption || !gasLimit) return ZERO
        const result = GasEditor.fromConfig(chainId as ChainId, gasOption).getGasFee(gasLimit)
        if (!currentGasCurrency || isSameAddress(nativeToken?.address, currentGasCurrency)) {
            return result
        }
        if (!currencyRatio) return ZERO
        return new BigNumber(toFixed(result.multipliedBy(currencyRatio), 0))
    }, [gasLimit, gasOption, currencyRatio, currentGasCurrency, nativeToken])

    const gasFeeUSD = useMemo(() => {
        if (!gasFee || gasFee.isZero()) return '$0'
        if (!currentGasCurrency || isSameAddress(nativeToken?.address, currentGasCurrency)) {
            return formatCurrency(formatWeiToEther(gasFee).times(nativeTokenPrice), 'USD', {
                onlyRemainTwoDecimal: true,
            })
        }

        if (!currencyToken || !currencyTokenPrice) return '$0'

        return formatCurrency(
            new BigNumber(formatBalance(gasFee, currencyToken?.decimals)).times(currencyTokenPrice),
            'USD',
            { onlyRemainTwoDecimal: true },
        )
    }, [
        gasFee,
        nativeTokenPrice,
        currencyTokenPrice,
        nativeToken?.address,
        currentGasCurrency,
        currencyToken?.decimals,
    ])

    return gasOptions && !isZero(gasFee) ? (
        <Box className={classes.section}>
            <Typography className={classes.title}>{t.gas_settings_label_gas_fee()}</Typography>
            <Typography className={classes.gasSection} component="div">
                <FormattedBalance
                    value={gasFee}
                    decimals={currencyToken?.decimals ?? 0}
                    significant={4}
                    symbol={currencyToken?.symbol}
                    formatter={formatBalance}
                />
                <Typography className={classes.gasUSDPrice}>{t.gas_usd_price({ usd: gasFeeUSD })}</Typography>
                <div className={classes.root} onClick={gasOptions ? openMenu : undefined}>
                    <Typography className={classes.text}>
                        {isCustomGas ? t.gas_settings_custom() : GAS_OPTION_NAMES[currentGasOptionType]}
                    </Typography>
                    <Icons.Candle width={12} height={12} />
                </div>
                {supportMultiCurrency ? <Icons.ArrowDrop onClick={openCurrencyMenu} /> : null}
                {menu}
                {supportMultiCurrency ? currencyMenu : null}
            </Typography>
            <ApproveMaskDialog open={approveDialogOpen} handleClose={() => setApproveDialogOpen(false)} />
        </Box>
    ) : null
}
