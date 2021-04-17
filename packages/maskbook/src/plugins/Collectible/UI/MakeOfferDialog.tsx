import { FC, useCallback, useState } from 'react'
import {
    Box,
    Checkbox,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Link,
    createStyles,
    makeStyles,
    TextField,
    Input,
    NativeSelect,
    Typography,
} from '@material-ui/core'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { PluginCollectibleMessage } from '../messages'

const useStyles = makeStyles((theme) =>
    createStyles({
        itemInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        texts: {
            marginLeft: theme.spacing(1),
        },
        form: {
            marginBottom: theme.spacing(1),
        },
        field: {
            marginBottom: theme.spacing(1),
        },
        checkItem: {
            display: 'flex',
            alignItems: 'flex-start',
        },
        checkLabel: {
            fontSize: 14,
            lineHeight: 1.75,
            [theme.breakpoints.down('sm')]: {
                fontSize: 12,
            },
        },
        selectBox: {},
        startAdornment: {
            borderRight: `1px solid`,
        },
        endAdornment: {
            borderLeft: `1px solid`,
        },
        datetimeInput: {
            '&::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)',
            },
        },
        timeInput: {
            '&::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)',
            },
        },
    }),
)

export function useControlledMakeOfferDialog() {
    const [open, setOpen] = useRemoteControlledDialog(PluginCollectibleMessage.events.makeOfferDialogEvent)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [])
    const onOpen = useCallback(() => {
        setOpen({
            open: true,
        })
    }, [])
    return {
        open,
        onClose,
        onOpen,
    }
}

const paymentOptions = [
    {
        value: 'DAI',
        label: 'DAI',
    },
    {
        value: 'WETH',
        label: 'WETH',
    },
    {
        value: 'USDC',
        label: 'USDC',
    },
    {
        value: 'DHC',
        label: 'DHC',
    },
]

const expirationOptions = [
    {
        value: 'in_3_days',
        label: 'In 3 days',
    },
    {
        value: 'in_7_days',
        label: 'In 7 days',
    },
    {
        value: 'in_1_month',
        label: 'In a month',
    },
    {
        value: 'custom_date',
        label: 'Custom date',
    },
]

export const MakeOfferDialog: FC = () => {
    const classes = useStyles()
    const [price, setPrice] = useState('1')
    const [amount, setAmount] = useState<number | ''>('')
    const [expiration, setExpiration] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const { open, onClose } = useControlledMakeOfferDialog()
    const [payment, setPayment] = useState(paymentOptions[0].value)
    const [expirationType, setExpirationType] = useState(expirationOptions[0].value)
    const isCustomDate = expirationType === 'custom_date'

    const onMakeOffer = useCallback(() => {}, [])

    return (
        <InjectedDialog open={open} onClose={onClose} title="Make an Offer">
            <DialogContent>
                <details>
                    <summary>This item has not been reviewed by Maskbook</summary>
                    <div>
                        You should proceed with extra caution. Anyone can create a digital item on a blockchain with any
                        name, including fake versions of existing items. Please take extra caution and do your research
                        when interacting with this item to ensure it's what it claims to be.
                    </div>
                </details>
                <div className={classes.form}>
                    <div className={classes.field}>
                        <TextField
                            label="price"
                            value={amount}
                            fullWidth
                            onChange={(evt) => {
                                const { value } = evt.currentTarget
                                setAmount(value ? parseInt(value, 10) : '')
                            }}
                            InputProps={{
                                startAdornment: (
                                    <Box className={classes.selectBox}>
                                        <NativeSelect value={payment} onChange={(evt) => setPayment(evt.target.value)}>
                                            {paymentOptions.map((option) => (
                                                <option value={option.value}>{option.label}</option>
                                            ))}
                                        </NativeSelect>
                                    </Box>
                                ),
                                endAdornment: (
                                    <Box>
                                        <Typography>$100,10.00</Typography>
                                    </Box>
                                ),
                            }}
                        />
                    </div>
                    <div className={classes.field}>
                        <TextField
                            label="Offer Expiration"
                            value={expiration}
                            fullWidth
                            onChange={(evt) => {
                                setExpiration(evt.target.value)
                            }}
                            InputProps={{
                                type: isCustomDate ? 'date' : 'time',
                                className: classes.datetimeInput,
                                startAdornment: (
                                    <Box>
                                        <NativeSelect
                                            value={expirationType}
                                            onChange={(evt) => setExpirationType(evt.target.value)}>
                                            {expirationOptions.map((option) => (
                                                <option value={option.value}>{option.label}</option>
                                            ))}
                                        </NativeSelect>
                                    </Box>
                                ),
                                endAdornment: isCustomDate ? (
                                    <Box>
                                        <Input className={classes.timeInput} type="time" />
                                    </Box>
                                ) : null,
                            }}
                        />
                    </div>
                    <Box>
                        <FormControlLabel
                            className={classes.checkItem}
                            control={
                                <Checkbox
                                    checked={confirmed}
                                    onChange={() => setConfirmed((confirmed) => !confirmed)}
                                />
                            }
                            label={
                                <Typography className={classes.checkLabel} variant="body2">
                                    By checking this box, I acknowledge that this item has not been reviewed or approved
                                    by Maskbook
                                </Typography>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={confirmed}
                                    onChange={() => setConfirmed((confirmed) => !confirmed)}
                                />
                            }
                            label={
                                <Typography className={classes.checkLabel} variant="body2">
                                    By checking this box, I agree Maskbook's
                                    <Link href="https://mask.io" target="_blank">
                                        Terms of Service
                                    </Link>
                                </Typography>
                            }
                        />
                    </Box>
                </div>
            </DialogContent>
            <DialogActions>
                <ActionButton fullWidth variant="contained" size="large" onClick={onMakeOffer}>
                    Make Offer
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
}
