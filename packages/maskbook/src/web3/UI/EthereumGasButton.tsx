import {
    Button,
    ButtonProps,
    CircularProgress,
    Typography,
    createStyles,
    DialogContent,
    makeStyles,
    TextField,
    DialogActions,
    ButtonBase,
    Grid,
} from '@material-ui/core'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { useGasPrices } from '../hooks/useGasPrices'
import { useStylesExtends } from '../../components/custom-ui-helper'
import type { GasPrice } from '../../plugins/Wallet/types'
import { InjectedDialog } from '../../components/shared/InjectedDialog'
import { useI18N } from '../../utils/i18n-next-ui'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { GAS_CUSTOM_WAIT, GAS_LIMIT } from '../constants'
import SpacedButtonGroup from '../../extension/options-page/DashboardComponents/SpacedButtonGroup'
import BigNumber from 'bignumber.js'
import { useTransakGetPriceForETH } from '../hooks/useTransakGetPriceForETH'
import { currentGasPriceSettings } from '../../settings/settings'

const useGasPriceItemStyles = makeStyles((theme) => {
    return createStyles<string, { hover: boolean }>({
        root: {
            width: '100%',
            justifyContent: 'left',
        },
        content: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(1),
            border: '1px solid grey',
            borderRadius: 10,
            margin: theme.spacing(1),
            textAlign: 'left',
        },

        title: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'cener',
            paddingBottom: theme.spacing(1),
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: 'grey',
        },
        price: {
            paddingBottom: theme.spacing(1),
            flexDirection: 'row',
            justifyContent: 'space-between',
            display: 'flex',
            alignItems: 'center',
            height: 34,
        },
        eth: {
            marginTop: theme.spacing(1),
            textAlign: 'left',
        },
        text: {
            borderRadius: 5,
            marginRight: 5,
            '& > *:first-child': {
                borderRadius: theme.shape.borderRadius,
            },
        },
    })
})

interface GasPriceItemProps {
    gasPrice: GasPrice
    primary?: string
    secondary?: string
    active?: boolean
    usd?: string
    onChange?: (gasPrice: GasPrice) => void
}
function CalcETH(amount: string) {
    return new BigNumber(amount).div(1e9).multipliedBy(GAS_LIMIT).toFixed()
}

function GasPriceItem(props: GasPriceItemProps) {
    const { gasPrice, primary = 'green', secondary = 'grey', active = false, onChange, usd } = props
    const [hover, setHover] = useState(false)
    const [amountForUI, setAmountForUI] = useState(gasPrice.gasPrice)
    const classes = useGasPriceItemStyles({ hover })
    const [eth, setETH] = useState(CalcETH(gasPrice.gasPrice))
    const [focuse, setFocuse] = useState(false)

    const handleAmount = useCallback(
        (amount: string) => {
            if (amount === '') setAmountForUI('')
            if (/^\d+[\.]?\d*$/.test(amount)) {
                setAmountForUI(amount)
                setETH(CalcETH(amount || '0'))
                onChange?.({
                    ...gasPrice,
                    gasPrice: amount,
                })
            }
        },
        [gasPrice, onChange],
    )

    const onClick = useCallback(() => {
        onChange?.(gasPrice)
        if (gasPrice.title === 'Custom') {
            setFocuse(true)
        }
    }, [gasPrice, onChange])

    return (
        <Grid item xs={4}>
            <ButtonBase className={classes.root}>
                <div
                    className={classes.content}
                    style={{
                        borderColor: active || hover ? primary : 'inherit',
                    }}
                    onClick={onClick}>
                    <div className={classes.title}>
                        <Typography variant="body1" color="textSecondary">
                            {gasPrice.title}
                        </Typography>
                        <div
                            className={classes.dot}
                            style={{
                                backgroundColor: hover || active ? primary : secondary,
                            }}
                        />
                    </div>
                    <div className={classes.price}>
                        {gasPrice.title !== 'Custom' ? (
                            <Typography variant="body1" color="textPrimary">
                                {gasPrice.gasPrice}
                            </Typography>
                        ) : (
                            <TextField
                                autoFocus={focuse}
                                className={classes.text}
                                size="small"
                                variant="outlined"
                                placeholder="0.0"
                                margin="none"
                                value={amountForUI}
                                onChange={(e) => handleAmount(e.target.value)}
                            />
                        )}
                        <Typography variant="body1" color="textPrimary">
                            Gwei
                        </Typography>
                    </div>
                    <div className={classes.eth}>
                        <Typography variant="body2" color="textPrimary">
                            {`${gasPrice.title === 'Custom' ? GAS_CUSTOM_WAIT : gasPrice.wait} min`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {`${eth} ETH`}
                        </Typography>
                        <div>
                            <Typography variant="body2" color="textSecondary">
                                &#8776; ${new BigNumber(usd || '0').multipliedBy(eth).toFixed(6)}
                            </Typography>
                        </div>
                    </div>
                </div>
            </ButtonBase>
        </Grid>
    )
}

const useGasPricesLitsStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
    }),
)

interface GasPricesListProps {
    gasPrices: GasPrice[]
    selectedIndex: number
    usd?: string
    onChange?: (index: number, gasPrice: GasPrice) => void
}

export function GasPricesList(props: GasPricesListProps) {
    const classes = useGasPricesLitsStyles()
    const { gasPrices = [], onChange, selectedIndex = 0, usd } = props
    const [selected, setSelected] = useState(selectedIndex)

    const handleOnChange = useCallback(
        (index: number, gasPrice: GasPrice) => {
            if (selected !== index) {
                setSelected(index)
            }
            onChange?.(index, gasPrice)
        },
        [selected, onChange],
    )
    return (
        <div className={classes.root}>
            {gasPrices.map((item, index) => (
                <Fragment key={index}>
                    <GasPriceItem
                        usd={usd}
                        key={index}
                        active={selected === index}
                        gasPrice={item}
                        onChange={(gasPrice: GasPrice) => handleOnChange(index, gasPrice)}
                    />
                </Fragment>
            ))}
        </div>
    )
}

const useDialogStyles = makeStyles((theme) =>
    createStyles({
        content: {
            padding: theme.spacing(2, 4),
        },
        hit: {
            padding: theme.spacing(1),
        },
        dialogAction: {
            display: 'flex',
            justifyContent: 'center',
            padding: theme.spacing(2, 4),
        },
    }),
)

interface EthereumGasDialogProps {
    gasPrices?: GasPrice[]
    open: boolean
    usd?: string
    onSubmit?: (gasPrice?: GasPrice) => void
    onClose: () => void
}

function EthereumGasDialog(props: EthereumGasDialogProps) {
    const { t } = useI18N()
    const classes = useDialogStyles()
    const { gasPrices = [], onClose, onSubmit, usd } = props
    const [gasPrice, setGasPrice] = useState<GasPrice | null>(gasPrices && gasPrices.length > 0 ? gasPrices[0] : null)
    const [selected, setSeleted] = useState(0)

    const onChange = (index: number, gasPrice: GasPrice) => {
        setGasPrice(gasPrice)
        setSeleted(index)
    }
    const handleClick = useCallback(() => {
        onSubmit?.(gasPrice!)
        onClose()
    }, [gasPrice, onClose, onSubmit])

    const handleDefault = useCallback(() => {
        onClose()
    }, [onClose])

    return (
        <InjectedDialog open={props.open} title={t('gas_price_dialog_title')} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Grid container spacing={2}>
                    <GasPricesList usd={usd} selectedIndex={selected} onChange={onChange} gasPrices={gasPrices} />
                </Grid>
                <div className={classes.hit}>
                    <Typography variant="body1" color="textPrimary">
                        {t('gas_price_dialog_hit')}
                    </Typography>
                </div>
            </DialogContent>
            <DialogActions className={classes.dialogAction}>
                <SpacedButtonGroup>
                    <ActionButton variant="contained" color="inherit" onClick={handleDefault}>
                        {t('cancel')}
                    </ActionButton>
                    <ActionButton variant="contained" color="primary" onClick={handleClick}>
                        {t('confirm')}
                    </ActionButton>
                </SpacedButtonGroup>
            </DialogActions>
        </InjectedDialog>
    )
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {},
    }),
)

export interface EthereumGasButtonProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    ButtonProps?: Partial<ButtonProps>
}

export function EthereumGasButton(props: EthereumGasButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { loading: loadingGasPrice, value: gasPrices = [] } = useGasPrices()
    const { value: usd, loading: loadingUSD } = useTransakGetPriceForETH()
    const { ButtonProps } = props

    const [open, setOpen] = useState(false)
    const [gasPrice, setGasPrice] = useState<GasPrice>()
    const [gasPricesForUI, setGasPricesForUI] = useState<GasPrice[]>([])

    useEffect(() => {
        setGasPricesForUI(gasPrices)
        setGasPrice(gasPrices[0])
    }, [gasPrices])

    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(!open)
    }

    const onClose = useCallback(() => {
        setOpen(false)
    }, [])

    const onSubmit = useCallback(
        (gasPrice?: GasPrice) => {
            if (gasPrice) {
                setGasPricesForUI(
                    gasPricesForUI.map((item) =>
                        item.title === gasPrice.title ? { ...item, gasPrice: gasPrice.gasPrice } : item,
                    ),
                )
                setGasPrice(gasPrice)

                //return wei
                currentGasPriceSettings.value = new BigNumber(gasPrice.gasPrice).multipliedBy(1e9).toFixed()
            }

            onClose()
        },
        [gasPricesForUI, onClose],
    )

    return (
        <>
            <Button
                variant="outlined"
                {...ButtonProps}
                endIcon={loadingGasPrice && loadingUSD ? null : <ArrowDropDownIcon fontSize="small" />}
                aria-haspopup="true"
                onClick={handleClickListItem}>
                {loadingGasPrice && loadingUSD ? (
                    <CircularProgress size="1.5rem" />
                ) : (
                    `${gasPrice?.gasPrice} | ${gasPrice?.title}`
                )}
            </Button>
            <EthereumGasDialog usd={usd} open={open} onClose={onClose} gasPrices={gasPricesForUI} onSubmit={onSubmit} />
        </>
    )
}
