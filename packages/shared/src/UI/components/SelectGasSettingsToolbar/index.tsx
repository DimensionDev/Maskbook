import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { FormattedBalance, SelectGasSettingsModal, useMenuConfig } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { formatBalance, formatCurrency, GasOptionType, isZero, ZERO } from '@masknet/web3-shared-base'
import {
    type ChainId,
    formatGas,
    formatWeiToEther,
    type GasConfig,
    GasEditor,
    type Transaction,
} from '@masknet/web3-shared-evm'
import { Box, MenuItem, type MenuProps, Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { SettingsContext } from '../SettingsBoard/Context.js'

export interface SelectGasSettingsToolbarProps<T extends NetworkPluginID = NetworkPluginID>
    extends withClasses<'label' | 'root'> {
    pluginID?: T
    chainId?: Web3Helper.ChainIdAll
    nativeToken: Web3Helper.FungibleTokenAll
    nativeTokenPrice: number
    gasLimit: number | bigint | null | undefined
    gasConfig?: GasConfig
    estimateGasFee?: string
    editMode?: boolean
    /** No effects on editMode */
    className?: string
    onChange?(gasConfig: GasConfig): void
    /** Will open internal setting dialog instead if not provided */
    onOpenCustomSetting?(): void
    MenuProps?: Partial<MenuProps>
}

const useStyles = makeStyles()((theme) => {
    return {
        button: {
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
        root: {
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
        edit: {
            lineHeight: '18px',
            color: theme.palette.maskColor.primary,
            marginRight: 4,
            fontWeight: 700,
            cursor: 'pointer',
        },
    }
})

export const SelectGasSettingsToolbar = memo(function SelectGasSettingsToolbar(props: SelectGasSettingsToolbarProps) {
    const { pluginID } = useNetworkContext(props.pluginID)
    const { chainId } = useChainContext({ chainId: props.chainId })

    return (
        <SettingsContext initialState={{ pluginID, chainId }}>
            <SelectGasSettingsToolbarUI {...props} />
        </SettingsContext>
    )
})

export function SelectGasSettingsToolbarUI({
    gasConfig: gasOption,
    gasLimit,
    nativeToken,
    nativeTokenPrice,
    estimateGasFee,
    editMode,
    className,
    classes: externalClasses,
    onChange,
    onOpenCustomSetting,
    MenuProps,
}: SelectGasSettingsToolbarProps) {
    const { classes, cx, theme } = useStyles(undefined, { props: { classes: externalClasses } })
    const { gasOptions, GAS_OPTION_NAMES } = SettingsContext.useContainer()

    const [isCustomGas, setIsCustomGas] = useState(false)
    const [currentGasOptionType, setCurrentGasOptionType] = useState<GasOptionType>(
        gasOption?.gasOptionType && gasOption.gasOptionType !== GasOptionType.CUSTOM ?
            gasOption.gasOptionType
        :   GasOptionType.NORMAL,
    )
    const { chainId } = useChainContext()
    const Utils = useWeb3Utils()

    const isSupportEIP1559 = Utils.chainResolver.isFeatureSupported(chainId, 'EIP1559')
    const setGasConfigCallback = useCallback(
        (maxFeePerGas: string, maxPriorityFeePerGas: string, gasPrice: string) =>
            onChange?.(
                isSupportEIP1559 ?
                    {
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                        gas: new BigNumber(String(gasLimit ?? 0)).toString(),
                        gasOptionType: isCustomGas ? GasOptionType.CUSTOM : currentGasOptionType,
                    }
                :   {
                        gasPrice: new BigNumber(maxFeePerGas).gt(0) ? maxFeePerGas : gasPrice,
                        gas: new BigNumber(String(gasLimit ?? 0)).toString(),
                        gasOptionType: isCustomGas ? GasOptionType.CUSTOM : currentGasOptionType,
                    },
            ),
        [isSupportEIP1559, chainId, onChange, gasLimit, currentGasOptionType, isCustomGas],
    )

    const openCustomGasSettingsDialog = useCallback(async () => {
        setIsCustomGas(true)
        if (typeof onOpenCustomSetting === 'function') {
            onOpenCustomSetting()
            return
        }

        const { settings } = await SelectGasSettingsModal.openAndWaitForClose({
            chainId,
            disableGasLimit: true,
            disableSlippageTolerance: true,
            transaction: gasOption,
        })
        if (!settings?.transaction) return

        setGasConfigCallback(
            (settings.transaction as Transaction).maxFeePerGas!,
            (settings.transaction as Transaction).maxPriorityFeePerGas!,
            (settings.transaction as Transaction).gasPrice!,
        )
    }, [chainId, gasOption, setGasConfigCallback, onOpenCustomSetting])

    const currentGasOption = gasOptions?.[currentGasOptionType]
    useEffect(() => {
        if (!currentGasOption || isCustomGas) return

        setGasConfigCallback(
            currentGasOption.suggestedMaxFeePerGas,
            currentGasOption.suggestedMaxPriorityFeePerGas,
            currentGasOption.suggestedMaxPriorityFeePerGas,
        )
    }, [currentGasOption, isCustomGas, setGasConfigCallback])

    const [menu, openMenu] = useMenuConfig(
        Object.entries(gasOptions ?? {})
            .reverse()
            .filter(([type]) => type !== GasOptionType.CUSTOM)
            .map(([type, { suggestedMaxFeePerGas, estimatedBaseFee }]) => {
                const gas = formatGas(isZero(suggestedMaxFeePerGas) ? estimatedBaseFee : suggestedMaxFeePerGas)
                return (
                    <MenuItem
                        key={type}
                        className={cx(classes.menuItem, classes.menuItemBorder)}
                        onClick={() => {
                            setIsCustomGas(false)
                            setCurrentGasOptionType(type as GasOptionType)
                        }}>
                        <Typography className={classes.title}>{GAS_OPTION_NAMES[type as GasOptionType]}</Typography>
                        <Typography className={classes.estimateGas}>{gas}</Typography>
                    </MenuItem>
                )
            })
            .concat(
                <MenuItem key="setting" className={cx(classes.menuItem)} onClick={openCustomGasSettingsDialog}>
                    <Typography className={classes.title}>
                        <Trans>Custom</Trans>
                    </Typography>
                </MenuItem>,
            ),
        {
            ...MenuProps,
            anchorSibling: false,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
                ...MenuProps?.anchorOrigin,
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
                ...MenuProps?.transformOrigin,
            },
            PaperProps: {
                ...MenuProps?.PaperProps,
                style: {
                    background: theme.palette.maskColor.bottom,
                    transform: 'translateY(8px)',
                    ...MenuProps?.PaperProps?.style,
                },
            },
        },
    )

    const gasFee = useMemo(() => {
        if (!gasOption || !gasLimit) return ZERO
        const result = GasEditor.fromConfig(chainId as ChainId, gasOption).getGasFee(String(gasLimit))
        return result
    }, [gasLimit, gasOption, nativeToken])

    const gasFeeUSD = useMemo(() => {
        if (!gasFee || gasFee.isZero()) return '$0'
        return formatCurrency(formatWeiToEther(gasFee).times(nativeTokenPrice), 'USD', {
            onlyRemainTwoOrZeroDecimal: true,
        })
    }, [gasFee, nativeTokenPrice, nativeToken?.address])

    if (!gasOptions || isZero(gasFee)) return null

    if (editMode)
        return (
            <Typography variant="body1" color="textPrimary" align="right" className={className}>
                <Typography component="span" className={classes.edit} onClick={openCustomGasSettingsDialog}>
                    <Trans>Edit</Trans>
                </Typography>
                <FormattedBalance
                    value={gasFee ?? estimateGasFee}
                    decimals={nativeToken?.decimals}
                    symbol={nativeToken?.symbol}
                    formatter={formatBalance}
                    significant={3}
                />
                ({gasFeeUSD})
            </Typography>
        )

    return (
        <Box className={cx(classes.root, className)}>
            <Typography className={cx(classes.label, classes.label)}>
                <Trans>Gas Fee</Trans>
            </Typography>
            <Typography className={classes.gasSection} component="div">
                <FormattedBalance
                    value={gasFee}
                    decimals={nativeToken?.decimals ?? 0}
                    significant={4}
                    symbol={nativeToken?.symbol}
                    formatter={formatBalance}
                />
                <Typography className={classes.gasUSDPrice}>≈ {gasFeeUSD}</Typography>
                <div className={classes.button} onClick={gasOptions ? openMenu : undefined}>
                    <Typography className={classes.text}>
                        {isCustomGas ?
                            <Trans>Custom</Trans>
                        :   GAS_OPTION_NAMES[currentGasOptionType]}
                    </Typography>
                    <Icons.Candle width={12} height={12} />
                </div>
                {menu}
            </Typography>
        </Box>
    )
}
