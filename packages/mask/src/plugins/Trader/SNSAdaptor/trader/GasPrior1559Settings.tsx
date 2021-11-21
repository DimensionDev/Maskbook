import { memo, useCallback, useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../Wallet/messages'
import {
    formatGweiToWei,
    formatWeiToEther,
    formatWeiToGwei,
    GasOptionConfig,
    useChainId,
    useNativeTokenDetailed,
} from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, TextField, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import classnames from 'classnames'
import { useNativeTokenPrice } from '../../../Wallet/hooks/useTokenPrice'
import { ExpandMore } from '@mui/icons-material'
import { toHex } from 'web3-utils'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles()((theme) => ({
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
        borderRadius: 24,
    },
}))

interface GasPrior1559SettingsProps {
    onCancel: () => void
    gasConfig?: GasOptionConfig
    onSave: (gasConfig?: GasOptionConfig) => void
}

export const GasPrior1559Settings = memo<GasPrior1559SettingsProps>(({ onCancel, onSave: onSave_, gasConfig }) => {
    const chainId = useChainId()
    const { classes } = useStyles()
    const { t } = useI18N()
    const [selected, setOption] = useState<number>(1)
    const [customGasPrice, setCustomGasPrice] = useState('0')

    //#region Get gas options from debank
    const { value: gasOptions } = useAsync(async () => {
        const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
        if (!response) return { slow: 0, standard: 0, fast: 0 }

        return {
            slow: response.data.slow.price,
            standard: response.data.normal.price,
            fast: response.data.fast.price,
        }
    }, [chainId])
    //#endregion

    const options = useMemo(
        () => [
            {
                title: t('plugin_trader_gas_setting_standard'),
                gasPrice: gasOptions?.standard ?? 0,
            },
            {
                title: t('plugin_trader_gas_setting_fast'),
                gasPrice: gasOptions?.fast ?? 0,
            },
            {
                title: t('plugin_trader_gas_setting_custom'),
                isCustom: true,
                gasPrice: customGasPrice ? formatGweiToWei(customGasPrice) : 0,
            },
        ],
        [gasOptions, customGasPrice],
    )

    const { value: nativeToken } = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

    //#region Confirm function
    const handleConfirm = useCallback(() => {
        onSave_({
            gasPrice: toHex(new BigNumber(options[selected].gasPrice).toString()),
        })
    }, [selected, options])
    //#endregion

    useUpdateEffect(() => {
        if (gasConfig?.gasPrice && gasOptions) {
            const gasPrice = new BigNumber(gasConfig.gasPrice)
            if (gasPrice.isEqualTo(gasOptions.standard)) setOption(0)
            else if (gasPrice.isEqualTo(gasOptions.fast)) setOption(1)
            else {
                setCustomGasPrice(formatWeiToGwei(gasPrice).toString())
                setOption(2)
            }
        }
    }, [gasConfig, gasOptions])

    return (
        <>
            <Accordion className={classes.accordion} elevation={0}>
                <AccordionSummary className={classes.summary} expandIcon={<ExpandMore />}>
                    <Typography className={classes.heading}>{t('popups_wallet_gas_price')}</Typography>
                    <Typography className={classes.accordingTitle}>
                        {selected
                            ? t('plugin_trader_gas_option', {
                                  option: options[selected].title,
                                  value: formatWeiToGwei(options[selected].gasPrice ?? 0).toString(),
                              })
                            : null}
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
                                            formatWeiToGwei(option.gasPrice ?? 0).toString()
                                        )}
                                    </Typography>
                                    {t('wallet_transfer_gwei')}
                                </Typography>
                                <Typography className={classes.cost} marginTop={option.isCustom ? 4 : 6}>
                                    {t('popups_wallet_gas_fee_settings_usd', {
                                        usd: formatWeiToEther(option.gasPrice)
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
                <Button color="secondary" className={classes.button} onClick={onCancel}>
                    {t('cancel')}
                </Button>
                <Button
                    color="primary"
                    className={classes.button}
                    onClick={handleConfirm}
                    disabled={selected === 2 && !Number(customGasPrice)}>
                    {t('save')}
                </Button>
            </Box>
        </>
    )
})
