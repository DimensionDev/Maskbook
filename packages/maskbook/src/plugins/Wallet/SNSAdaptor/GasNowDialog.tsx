import { useValueRef, useRemoteControlledDialog } from '@masknet/shared'
import { formatWeiToGwei, GasNow, useEtherPrice } from '@masknet/web3-shared'
import { DialogContent, List, ListItem, Skeleton, TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { currentGasNowSettings, currentGasPriceSettings } from '../settings'
import { WalletMessages } from '../../Wallet/messages'

const useStyles = makeStyles()((theme) => ({
    content: {},
    list: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme.spacing(1),
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        width: 166,
        height: 160,
        border: `2px solid ${theme.palette.mode === 'dark' ? '#2f3336' : '#EBEEF0'}`,
        borderRadius: 12,
        cursor: 'pointer',
    },
    disableBox: {
        opacity: 0.4,
        cursor: 'default',
    },
    boxSelected: {
        border: '2px solid #1C68F3',
    },
    intro: {
        color: '#7B8192',
        padding: theme.spacing(1),
        fontSize: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: 300,
    },
    estimate: {
        color: '#7B8192',
        fontSize: 12,
    },
    gwei: {
        fontSize: 18,
        fontWeight: 400,
        display: 'inline-block',
    },
    gweiBox: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(0.75),
    },
    head: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        color: theme.palette.mode === 'dark' ? '#2F3336' : '#EBEEF0',
    },
    dotSelector: {
        color: '#1C68F3',
    },
    customInput: {
        width: 60,
        marginRight: theme.spacing(1),
    },
    button: {
        margin: `${theme.spacing(2)} auto`,
        minWidth: 260,
    },
}))

export function GasNowDialog() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const gasNow = useValueRef(currentGasNowSettings)
    const rapidGasFirstCache = useMemo(() => gasNow?.rapid, [])
    const [customGas, setCustomGas] = useState(formatWeiToGwei(rapidGasFirstCache ?? 0).toString())
    const customGasToWei = new BigNumber(customGas === '' ? 0 : Number(customGas) * 10 ** 9)
    const customEstimateTime = gasNow
        ? customGasToWei.isGreaterThan(gasNow.rapid)
            ? t('plugin_gas_now_dialog_sec', { time: 15 })
            : customGasToWei.isGreaterThan(gasNow.fast)
            ? t('plugin_gas_now_dialog_min', { time: 1 })
            : customGasToWei.isGreaterThan(gasNow.standard)
            ? t('plugin_gas_now_dialog_min', { time: 3 })
            : t('plugin_gas_now_dialog_min', { time: '>10' })
        : ''
    const { open, closeDialog, setDialog } = useRemoteControlledDialog(WalletMessages.events.gasPriceDialogUpdated)
    const [select, setSelect] = useState(gasNow ? 1 : 2)
    const etherPrice = useEtherPrice()
    const options = useMemo(
        () => [
            {
                title: t('plugin_gas_now_dialog_standard'),
                type: 'standard',
                gasPrice: gasNow?.standard ?? 0,
                time: t('plugin_gas_now_dialog_min', { time: 3 }),
            },
            {
                title: t('plugin_gas_now_dialog_fast'),
                type: 'fast',
                gasPrice: gasNow?.fast ?? 0,
                time: t('plugin_gas_now_dialog_min', { time: 1 }),
            },
            {
                title: t('plugin_gas_now_dialog_custom'),
                type: 'custom',
                gasPrice: customGasToWei.toNumber(),
                time: t('plugin_gas_now_dialog_sec', { time: 15 }),
            },
        ],
        [gasNow, customGas],
    )

    const validationMessage = useMemo(() => {
        if (select === 2 && customGasToWei.isEqualTo(0)) return t('plugin_gas_now_dialog_zero_gas')
        return ''
    }, [customGasToWei, options, select])

    const onConfrim = useCallback(() => {
        currentGasPriceSettings.value = select === 2 ? customGasToWei.toNumber() : options[select].gasPrice
        const type = options[select].type as keyof GasNow
        setDialog({ open: false, type })
    }, [customGasToWei, options, select, setDialog])

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_gas_now_dialog_title')} maxWidth="xl">
            <DialogContent className={classes.content}>
                <List className={classes.list}>
                    {options.map((option, i) => (
                        <ListItem
                            onClick={() => (i === 2 || gasNow) && setSelect(i)}
                            className={classNames(
                                classes.box,
                                i === select ? classes.boxSelected : undefined,
                                i !== 2 && !gasNow ? classes.disableBox : undefined,
                            )}
                            key={i}>
                            <div className={classes.head}>
                                <Typography color="textPrimary" className={classes.title}>
                                    {option.title}
                                </Typography>
                                <FiberManualRecordIcon
                                    className={classNames(classes.dot, i === select ? classes.dotSelector : undefined)}
                                />
                            </div>
                            {gasNow || i === 2 ? (
                                <>
                                    <div>
                                        {i === 2 ? (
                                            <div className={classes.gweiBox}>
                                                <TextField
                                                    className={classes.customInput}
                                                    InputProps={{
                                                        inputMode: 'decimal',
                                                    }}
                                                    value={customGas}
                                                    onChange={(e) => {
                                                        const v = e.target.value
                                                        setCustomGas(isNaN(Number(v)) ? '' : v)
                                                    }}
                                                />
                                                <Typography color="textPrimary" className={classes.gwei}>
                                                    {t('plugin_gas_now_dialog_gwei')}
                                                </Typography>
                                            </div>
                                        ) : (
                                            <Typography color="textPrimary" className={classes.gwei}>
                                                {t('plugin_gas_now_dialog_gwei', {
                                                    gasPrice: formatWeiToGwei(option.gasPrice),
                                                })}
                                            </Typography>
                                        )}
                                        {etherPrice ? (
                                            <Typography className={classes.estimate}>
                                                {t('plugin_gas_now_dialog_usd', {
                                                    usd: new BigNumber(option.gasPrice)
                                                        .div(10 ** 18)
                                                        .times(etherPrice)
                                                        .toPrecision(3),
                                                })}
                                            </Typography>
                                        ) : null}
                                    </div>
                                    <Typography color="textPrimary">
                                        {i === 2 ? customEstimateTime : option.time}
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Skeleton animation="wave" variant="rectangular" height={15} width="80%" />
                                    <Skeleton animation="wave" variant="rectangular" height={15} width="80%" />
                                    <Skeleton animation="wave" variant="rectangular" height={12} width="40%" />
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
                <Typography className={classes.intro}>{t('plugin_gas_now_dialog_intro')}</Typography>
                <EthereumWalletConnectedBoundary offChain>
                    <ActionButton
                        className={classes.button}
                        size="large"
                        disabled={!!validationMessage}
                        onClick={onConfrim}
                        variant="contained">
                        {validationMessage || t('confirm')}
                    </ActionButton>
                </EthereumWalletConnectedBoundary>
            </DialogContent>
        </InjectedDialog>
    )
}
