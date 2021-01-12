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
} from '@material-ui/core'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { useGasPrice } from '../hooks/useGasPrice'
import { usePortalShadowRoot } from '../../utils/shadow-root/usePortalShadowRoot'
import { useStylesExtends } from '../../components/custom-ui-helper'
import type { GasPrice } from '../../plugins/Wallet/types'
import { InjectedDialog } from '../../components/shared/InjectedDialog'
import { useI18N } from '../../utils/i18n-next-ui'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { GAS_CUSTOM_WAIT, GAS_LIMIT } from '../constants'
import SpacedButtonGroup from '../../extension/options-page/DashboardComponents/SpacedButtonGroup'
import BigNumber from 'bignumber.js'
import { useTransakGetPriceForETH } from '../hooks/useTransakGetPriceForETH'

interface CalcETHAmountProps {
    amount: string
}
function CalcETHAmount(props: CalcETHAmountProps) {
    const { amount } = props
    const { loading, value: fiat } = useTransakGetPriceForETH(amount)

    return (
        <>
            {loading ? (
                <CircularProgress size="0.5rem" />
            ) : (
                <Typography variant="body2" color="textSecondary">
                    &#8776; ${fiat?.fiatAmount ?? '0'}
                </Typography>
            )}
        </>
    )
}

const useGasPriceItemStyles = makeStyles((theme) => {
    return createStyles<string, { hover: boolean }>({
        root: {
            width: '30%',
            padding: theme.spacing(1),
            borderRadius: 10,
            margin: theme.spacing(1),
            border: '1px solid grey',
        },
        title: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
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
            '& > *: last-child': {
                flex: 1,
                paddingRight: theme.spacing(1),
            },
        },
        eth: {
            marginTop: theme.spacing(1),
        },
        text: {
            borderRadius: 5,
            marginRight: 5,
            '& > *:first-child': {
                borderRadius: 5,
            },
        },
    })
})

interface GasPriceItemProps {
    gasPrice: GasPrice
    primary?: string
    secondary?: string
    active?: boolean
    onChange?: (gasPrice: GasPrice) => void
}
function CalcETH(amount: string) {
    return new BigNumber(amount).multipliedBy('0.00000002').multipliedBy(GAS_LIMIT).toFixed()
}

function GasPriceItem(props: GasPriceItemProps) {
    const { gasPrice, primary = 'green', secondary = 'grey', active = false, onChange } = props
    const [hover, setHover] = useState(false)
    const [amountForUI, setAmountForUI] = useState(gasPrice.gasPrice)
    const classes = useGasPriceItemStyles({ hover })
    const [eth, setETH] = useState(CalcETH(gasPrice.gasPrice))
    const [focuse, setFocuse] = useState(false)
    const handleHoverIn = useCallback(() => {
        setHover(true)
        if (gasPrice.title === 'Custom') {
            setFocuse(true)
        }
    }, [gasPrice.title])

    const handleHoverOut = useCallback(() => {
        setHover(false)
        setFocuse(false)
    }, [])

    const handleAmount = useCallback(
        (amount: string) => {
            if (amount === '') setAmountForUI('')
            if (/^\d+[\.]?\d*$/.test(amount)) {
                setAmountForUI(amount)
                setETH(CalcETH(amount || '0'))
                onChange?.({
                    ...gasPrice,
                    gasPrice: amount,
                    eth: eth,
                })
            }
        },
        [eth, gasPrice, onChange],
    )

    const onClick = useCallback(() => {
        onChange?.(gasPrice)
        if (gasPrice.title === 'Custom') {
            setFocuse(true)
        }
    }, [gasPrice, onChange])

    return (
        <div
            className={classes.root}
            style={{
                backgroundColor: hover ? secondary : 'inherit',
                opacity: hover ? '0.6' : '1',
                borderColor: active || hover ? primary : 'inherit',
            }}
            onMouseEnter={handleHoverIn}
            onMouseLeave={handleHoverOut}
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
                    {`${(gasPrice.title === 'Custom' ? GAS_CUSTOM_WAIT : Number(gasPrice.wait)) / 60} min`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {`${eth} ETH`}
                </Typography>
                <div>
                    <CalcETHAmount amount={eth} />
                </div>
            </div>
        </div>
    )
}

const useGasPricesLitsStyles = makeStyles((theme) =>
    createStyles({
        root: {
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
    onChange?: (index: number, gasPrice: GasPrice) => void
}

export function GasPricesList(props: GasPricesListProps) {
    const classes = useGasPricesLitsStyles()
    const { gasPrices = [], onChange, selectedIndex = 0 } = props
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
        content: {},
        hit: {
            padding: theme.spacing(1),
        },
        dialogAction: {
            display: 'flex',
            justifyContent: 'center',
        },
    }),
)

interface EthereumGasDialogProps {
    gasPrices?: GasPrice[]
    open: boolean
    onSubmit?: (gasPrice: GasPrice) => void
    onClose: () => void
}

function EthereumGasDialog(props: EthereumGasDialogProps) {
    const { t } = useI18N()
    const classes = useDialogStyles()
    const { gasPrices = [], onClose, onSubmit } = props
    const [gasPrice, setGasPrice] = useState<GasPrice>()
    const [selected, setSeleted] = useState(0)

    const onChange = (index: number, gasPrice: GasPrice) => {
        setGasPrice(gasPrice)
        setSeleted(index)
    }
    const handleClick = useCallback(() => {
        onSubmit?.(gasPrice!)
        onClose()
    }, [gasPrice, onClose, onSubmit])

    return (
        <InjectedDialog open={props.open} title={t('gas_price_dialog_title')} onClose={onClose}>
            <DialogContent className={classes.content}>
                <GasPricesList selectedIndex={selected} onChange={onChange} gasPrices={gasPrices} />
                <div className={classes.hit}>
                    <Typography variant="body1" color="textPrimary">
                        {t('gas_price_dialog_hit')}
                    </Typography>
                </div>
            </DialogContent>
            <DialogActions className={classes.dialogAction}>
                <SpacedButtonGroup>
                    <ActionButton variant="contained" onClick={onClose}>
                        {t('cancel')}
                    </ActionButton>
                    <ActionButton variant="contained" onClick={handleClick}>
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
    onChange?: (gasPrice: GasPrice) => void
}

export function EthereumGasButton(props: EthereumGasButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { loading, value: gasPrices = [] } = useGasPrice()
    const { ButtonProps, onChange } = props

    const [open, setOpen] = useState(false)
    const [gasPrice, setGasPrice] = useState<GasPrice | undefined>()
    const [gasPricesForUI, setGasPricesForUI] = useState<GasPrice[]>([])

    useEffect(() => {
        const custom = {
            title: 'Custom',
            gasPrice: '0',
            eth: '0',
            usd: '0',
        } as GasPrice

        setGasPricesForUI([...gasPrices?.filter((item) => item.title === 'Standard' || item.title === 'Fast'), custom])
        setGasPrice(gasPrices?.[0] ?? custom)
    }, [gasPrices, setGasPricesForUI, setGasPrice])

    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(!open)
    }

    const onClose = useCallback(() => {
        setOpen(false)
    }, [])

    const onSubmit = useCallback(
        (gasPrice: GasPrice) => {
            if (gasPrice) {
                setGasPricesForUI(
                    gasPricesForUI.map((item) =>
                        item.title === gasPrice.title ? { ...item, gasPrice: gasPrice.gasPrice } : item,
                    ),
                )
                setGasPrice(gasPrice)
            }

            onChange?.(gasPrice)
            onClose()
        },
        [gasPricesForUI, onChange, onClose],
    )

    return usePortalShadowRoot((container) => (
        <>
            <Button
                variant="outlined"
                {...ButtonProps}
                endIcon={loading ? null : <ArrowDropDownIcon fontSize="small" />}
                aria-haspopup="true"
                onClick={handleClickListItem}>
                {loading ? <CircularProgress size="1.5rem" /> : `${gasPrice?.gasPrice} | ${gasPrice?.title}`}
            </Button>
            <EthereumGasDialog open={open} onClose={onClose} gasPrices={gasPricesForUI} onSubmit={onSubmit} />
        </>
    ))
}
