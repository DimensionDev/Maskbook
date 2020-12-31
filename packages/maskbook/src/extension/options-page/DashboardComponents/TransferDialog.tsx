import {
    Box,
    Button,
    createStyles,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
    Theme,
    Typography,
} from '@material-ui/core'
import { Send as SendIcon } from 'react-feather'
import { ChangeEvent, useState } from 'react'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import {
    DashboardDialogCore,
    DashboardDialogWrapper,
    useSnackbarCallback,
    WrappedDialogProps,
} from '../DashboardDialogs/Base'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useCopyToClipboard } from 'react-use'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import { QRCode } from '../../../components/shared/qrcode'
import { useCallback } from 'react'
import { BigNumber } from 'bignumber.js'
import { formatBalance } from '../../../plugins/Wallet/formatter'

interface WalletProps {
    wallet: WalletRecord
}

//#region transfer tab
const useTransferTabStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
        },
        button: {
            marginTop: theme.spacing(2),
        },
    }),
)

interface TransferTabProps {
    wallet: WalletRecord
    token: ERC20TokenDetailed | EtherTokenDetailed
    onClose: () => void
}

function TransferTab(props: TransferTabProps) {
    const classes = useTransferTabStyles()
    const { wallet, token, onClose } = props
    const { t } = useI18N()

    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')

    // balance
    const { value: tokenBalance = '0' } = useTokenBalance(token?.type ?? EthereumTokenType.Ether, token?.address ?? '')

    const onChangeAmount = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const _amount = ev.currentTarget.value
        if (_amount === '') setAmount('')
        if (/^\d+[\.]?\d*$/.test(_amount)) {
            setAmount(_amount)
        }
    }, [])

    const onSend = useCallback(() => {
        props.onClose()
    }, [props])

    return (
        <div className={classes.root}>
            <TextField
                required
                label={t('wallet_transfer_amount')}
                placeholder="0.0"
                value={amount}
                onChange={(ev: ChangeEvent<HTMLInputElement>) => onChangeAmount(ev)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Typography variant="body2" color="textSecondary">
                                {token.symbol}
                            </Typography>
                        </InputAdornment>
                    ),
                }}
                helperText={t('wallet_transfer_balance', {
                    balance: formatBalance(new BigNumber(tokenBalance ?? '0'), token.decimals ?? 0),
                    symbol: token.symbol,
                })}
            />
            <TextField
                required
                label={t('wallet_transfer_to_address')}
                placeholder={t('wallet_transfer_to_address')}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
            />
            <TextField
                placeholder={t('wallet_transfer_memo')}
                label={t('wallet_transfer_memo')}
                value={memo}
                onChange={(ev) => setMemo(ev.target.value)}
            />
            <Button className={classes.button} variant="contained" color="primary" onClick={onSend}>
                {t('wallet_transfer_send')}
            </Button>
        </div>
    )
}
//#endregion

//#region receive tab
const useReceiveTab = makeStyles((theme: Theme) =>
    createStyles({
        qr: {
            marginTop: theme.spacing(2),
        },
        form: {
            padding: theme.spacing(1),
        },
    }),
)

interface ReceiveTabProps {
    wallet: WalletRecord
    onClose: () => void
}

function ReceiveTab(props: ReceiveTabProps) {
    const { wallet } = props
    const { t } = useI18N()
    const classes = useReceiveTab()

    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])
    return (
        <>
            <form className={classes.form}>
                <TextField
                    required
                    label={t('wallet_address')}
                    value={wallet.address}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation()
                                        copyWalletAddress(wallet.address)
                                    }}>
                                    <FileCopyOutlinedIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                />
            </form>
            <Box
                className={classes.qr}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <QRCode
                    text={`ethereum:${wallet.address}`}
                    options={{ width: 200 }}
                    canvasProps={{
                        style: { display: 'block', margin: 'auto' },
                    }}
                />
            </Box>
        </>
    )
}
//#endregion

export function DashboardWalletTransferDialog(
    props: WrappedDialogProps<WalletProps & { token: ERC20TokenDetailed | EtherTokenDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()
    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('wallet_transfer_send'),
                children: <TransferTab wallet={wallet} token={token} onClose={props.onClose} />,
                sx: { p: 0 },
            },
            {
                label: t('wallet_transfer_receive'),
                children: <ReceiveTab wallet={wallet} onClose={props.onClose} />,
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_menu')}
                icon={<SendIcon />}
                iconColor="#4EE0BC"
                size="medium"
                content={<AbstractTab height={268} {...tabProps} />}
            />
        </DashboardDialogCore>
    )
}
