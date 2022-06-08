import { memo, useCallback, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { formatGweiToEther, formatGweiToWei, formatWeiToGwei, GasOptionConfig } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { Accordion, AccordionDetails, AccordionSummary, Box, TextField, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import classnames from 'classnames'
import { ExpandMore } from '@mui/icons-material'
import { toHex } from 'web3-utils'
import BigNumber from 'bignumber.js'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { isDashboardPage } from '@masknet/shared-base'
import { useChainId, useFungibleToken, useGasOptions, useNativeTokenPrice } from '@masknet/plugin-infra/web3'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
    },
    pointer: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: MaskColorVar.twitterSecond,
    },
    optionTitle: {
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
    },
    option: {
        padding: '16px 14px',
        borderRadius: 4,
        border: `1px solid ${MaskColorVar.twitterLine}`,
        cursor: 'pointer',
    },
    selectedPointer: {
        backgroundColor: theme.palette.primary.main,
    },
    selected: {
        borderColor: theme.palette.primary.main,
    },
    gasPrice: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
    },
    textFieldInput: {
        borderRadius: 6,
    },
    input: {
        maxWidth: 42,
        padding: '11px 9px',
        fontSize: 12,
        borderRadius: 6,
    },
    cost: {
        fontSize: 12,
        lineHeight: '16px',
        color: MaskColorVar.twitterSecond,
    },
    heading: {
        flex: 1,
        fontWeight: 500,
        fontSize: 16,
        lineHeight: '22px',
    },
    summary: {
        padding: 0,
    },
    accordion: {
        backgroundColor: 'inherit',
    },
    accordingTitle: {
        fontSize: 14,
        lineHeight: '20px',
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 24,
    },
    button: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        height: 48,
        borderRadius: isDashboard ? 8 : 24,
    },
    cancelButton: {
        backgroundColor: !isDashboard ? theme.palette.background.default : undefined,
        color: !isDashboard ? theme.palette.text.strong : undefined,
        '&:hover': {
            backgroundColor: !isDashboard ? `${theme.palette.background.default}!important` : undefined,
        },
    },
}))

interface GasPrior1559SettingsProps {
    onCancel: () => void
    gasConfig?: GasOptionConfig
    onSave: (gasConfig?: GasOptionConfig) => void
    onSaveSlippage: () => void
}

export const GasPrior1559Settings = memo<GasPrior1559SettingsProps>(
    ({ onCancel, onSave: onSave_, gasConfig, onSaveSlippage }) => {
        const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
        const { value: gasOptions_ } = useGasOptions(NetworkPluginID.PLUGIN_EVM)
        const isDashboard = isDashboardPage()
        const { classes } = useStyles({ isDashboard })
        const { t } = useI18N()
        const [selected, setOption] = useState<number>(1)
        const [customGasPrice, setCustomGasPrice] = useState('0')

        // #region Get gas options from debank
        const gasOptions = useMemo(() => {
            return {
                slow: gasOptions_?.[GasOptionType.SLOW].suggestedMaxFeePerGas ?? 0,
                standard: gasOptions_?.[GasOptionType.NORMAL].suggestedMaxFeePerGas ?? 0,
                fast: gasOptions_?.[GasOptionType.FAST].suggestedMaxFeePerGas ?? 0,
            }
        }, [chainId, gasOptions_])
        // #endregion

        const options = useMemo(
            () => [
                {
                    title: t('plugin_trader_gas_setting_standard'),
                    gasPrice: gasOptions?.standard,
                },
                {
                    title: t('plugin_trader_gas_setting_fast'),
                    gasPrice: gasOptions?.fast,
                },
                {
                    title: t('plugin_trader_gas_setting_custom'),
                    isCustom: true,
                    gasPrice: customGasPrice ? customGasPrice : 0,
                },
            ],
            [gasOptions, customGasPrice],
        )

        const { value: nativeToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)
        const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
            chainId: nativeToken?.chainId,
        })

        // #region Confirm function
        const handleConfirm = useCallback(() => {
            onSave_({
                gasPrice: toHex(formatGweiToWei(options[selected].gasPrice).toString()),
            })
        }, [selected, options])
        // #endregion

        useUpdateEffect(() => {
            if (!(gasConfig?.gasPrice && gasOptions)) return
            const gasPrice = new BigNumber(gasConfig.gasPrice)
            if (gasPrice.isEqualTo(gasOptions.standard)) setOption(0)
            else if (gasPrice.isEqualTo(gasOptions.fast)) setOption(1)
            else {
                setCustomGasPrice(formatWeiToGwei(gasPrice).toString())
                setOption(2)
            }
        }, [gasConfig, gasOptions])

        useUpdateEffect(() => {
            setCustomGasPrice('0')
        }, [chainId])

        return (
            <>
                <Accordion className={classes.accordion} elevation={0} defaultExpanded>
                    <AccordionSummary className={classes.summary} expandIcon={<ExpandMore />}>
                        <Typography className={classes.heading}>{t('popups_wallet_gas_price')}</Typography>
                        <Typography className={classes.accordingTitle}>
                            {t('plugin_trader_gas_option', {
                                option: options[selected].title,
                                value: new BigNumber(options[selected].gasPrice ?? 0).toString(),
                            })}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <Box className={classes.container}>
                            {options.map((option, index) => (
                                <Box
                                    key={index}
                                    onClick={() => setOption(index)}
                                    className={classnames(
                                        classes.option,
                                        selected === index ? classes.selected : undefined,
                                    )}>
                                    <Box
                                        width="100%"
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={1.5}>
                                        <Typography className={classes.optionTitle}>{option.title}</Typography>
                                        <Box
                                            className={classnames(
                                                classes.pointer,
                                                selected === index ? classes.selectedPointer : undefined,
                                            )}
                                        />
                                    </Box>
                                    <Typography className={classes.gasPrice} component="div">
                                        <Typography component="span" marginRight={1}>
                                            {option.isCustom ? (
                                                <TextField
                                                    value={customGasPrice}
                                                    onChange={(e) => setCustomGasPrice(e.target.value)}
                                                    inputProps={{
                                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                                        className: classes.input,
                                                        'aria-autocomplete': 'none',
                                                    }}
                                                    InputProps={{ classes: { root: classes.textFieldInput } }}
                                                />
                                            ) : (
                                                new BigNumber(option.gasPrice ?? 0).toString()
                                            )}
                                        </Typography>
                                        {t('wallet_transfer_gwei')}
                                    </Typography>
                                    <Typography className={classes.cost} marginTop={option.isCustom ? 4 : 6}>
                                        {t('popups_wallet_gas_fee_settings_usd', {
                                            usd: formatGweiToEther(option.gasPrice)
                                                .times(nativeTokenPrice)
                                                .times(21000)
                                                .toPrecision(3),
                                        })}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Box className={classes.controller}>
                    <ActionButton
                        color="secondary"
                        variant="contained"
                        className={classnames(classes.button, classes.cancelButton)}
                        onClick={onCancel}>
                        {t('cancel')}
                    </ActionButton>
                    <ActionButton
                        color="primary"
                        variant="contained"
                        className={classes.button}
                        onClick={() => {
                            handleConfirm()
                            onSaveSlippage()
                        }}
                        disabled={selected === 2 && !Number(customGasPrice)}>
                        {t('save')}
                    </ActionButton>
                </Box>
            </>
        )
    },
)
