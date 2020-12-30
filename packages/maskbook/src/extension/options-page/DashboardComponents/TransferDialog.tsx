import {
    Box,
    Button,
    createStyles,
    FormControlLabel,
    IconButton,
    InputAdornment,
    makeStyles,
    Paper,
    Switch,
    TextField,
    Theme,
    Typography,
} from '@material-ui/core'
import { Share2 as ShareIcon, Info as InfoIcon } from 'react-feather'
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
import ShowcaseBox from './ShowcaseBox'
import { BigNumber } from 'bignumber.js'
import { formatBalance } from '../../../plugins/Wallet/formatter'

//#region wallet import dialog
interface WalletProps {
    wallet: WalletRecord
}

const useTransferPageStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            padding: theme.spacing(1),
        },
        line: {
            height: 60,
            padding: theme.spacing(1),
        },

        box: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        table: {
            display: 'none',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            '& > * ': {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                border: '1px solid rgba(224, 224, 224, 1)',
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
                alignItems: 'center',
            },
            '& > *:first-child': {
                borderBottomWidth: 0,
            },
            '& > *:last-chid': {
                borderTopWidth: 0,
            },
        },
    }),
)

interface TransferPageProps {
    wallet: WalletRecord
    token: ERC20TokenDetailed | EtherTokenDetailed
    onClose: () => void
}

function TransferPage(props: TransferPageProps) {
    const classes = useTransferPageStyles()
    const { wallet, token, onClose } = props
    const { t } = useI18N()

    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')

    // balance
    const { value: tokenBalance = '0' } = useTokenBalance(token?.type ?? EthereumTokenType.Ether, token?.address ?? '')
    //#endregion

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
        <Paper className={classes.paper}>
            <Box className={classes.box}>
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
                    inputProps={{
                        shrink: true,
                    }}
                    helperText={t('wallet_transfer_balance', {
                        balance: formatBalance(new BigNumber(tokenBalance ?? '0'), token.decimals ?? 0),
                        symbol: token.symbol,
                    })}
                />
            </Box>

            <Box className={classes.box}>
                <Typography align="center" variant="body2" color="textSecondary"></Typography>
            </Box>

            <Box className={classes.box}>
                <TextField
                    required
                    label={t('wallet_transfer_to_address')}
                    placeholder={t('wallet_transfer_to_address')}
                    value={address}
                    onChange={(ev) => setAddress(ev.target.value)}
                />
            </Box>
            <Box className={classes.table}>
                <Box className={classes.line}>
                    <Typography align="left" variant="body2" color="textPrimary" component="span">
                        Transaction fee
                    </Typography>
                    <Typography align="right" variant="body2" color="textSecondary" component="span">
                        Cost 0.0000167 ETH=$0.78
                    </Typography>
                </Box>
                <Box className={classes.line}>
                    <Typography align="left" variant="body2" color="textPrimary" component="span">
                        Advanced
                    </Typography>
                    <FormControlLabel
                        value="start"
                        control={<Switch color="primary" />}
                        label="Date"
                        labelPlacement="start"
                    />
                </Box>
            </Box>

            <Box className={classes.box}>
                <TextField
                    placeholder={t('wallet_transfer_memo')}
                    label={t('wallet_transfer_memo')}
                    value={memo}
                    onChange={(ev) => setMemo(ev.target.value)}
                />
            </Box>
            <Box className={classes.box}>
                <Button variant="contained" color="primary" onClick={onSend}>
                    {t('wallet_transfer_send')}
                </Button>
            </Box>
        </Paper>
    )
}

const useWalletShareDialogStyle = makeStyles((theme: Theme) =>
    createStyles({
        qr: {
            marginTop: theme.spacing(3),
        },
        text: {
            marginBottom: theme.spacing(2),
        },
    }),
)

interface SharePageProps {
    wallet: WalletRecord
    onClose: () => void
}
function SharePage(props: SharePageProps) {
    const { wallet } = props
    const { t } = useI18N()
    const classes = useWalletShareDialogStyle()

    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])
    return (
        <>
            <form>
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

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            padding: 40,
            height: '100%',
            overFlow: 'hidden',
        },
        content: {
            overFlow: 'hidden',
        },
    }),
)
export function DashboardWalletTransferDialog(
    props: WrappedDialogProps<WalletProps & { token: ERC20TokenDetailed | EtherTokenDetailed }>,
) {
    const classes = useStyles()
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()
    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('wallet_transfer_title'),
                children: (
                    <ShowcaseBox>
                        <TransferPage wallet={wallet} token={token} onClose={props.onClose} />
                    </ShowcaseBox>
                ),
                sx: { p: 0 },
            },
            {
                label: t('share'),
                children: (
                    <ShowcaseBox>
                        <SharePage wallet={wallet} onClose={props.onClose} />
                    </ShowcaseBox>
                ),
                sx: { p: 0 },
            },
        ],
        state,
    }
    const pageTitles = [
        {
            primary: t('wallet_transfer_title'),
            secondary: '',
            icon: <InfoIcon />,
        },
        {
            primary: t('share_wallet'),
            secondary: t('share_wallet_hint'),
            icon: <ShareIcon />,
        },
    ]

    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                {...pageTitles[state[0]]}
                iconColor="#4EE0BC"
                size="medium"
                content={<AbstractTab height={345} {...tabProps} />}
            />
        </DashboardDialogCore>
    )
}
