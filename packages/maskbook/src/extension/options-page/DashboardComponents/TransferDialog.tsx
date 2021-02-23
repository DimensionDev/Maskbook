import { ChangeEvent, useMemo, useState, useCallback, useEffect } from 'react'
import { Send as SendIcon } from 'react-feather'
import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
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
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useCopyToClipboard } from 'react-use'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import { QRCode } from '../../../components/shared/qrcode'
import { formatBalance, formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import { useTokenTransferCallback } from '../../../web3/hooks/useTokenTransferCallback'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useContext } from 'react'
import { DashboardWalletsContext } from '../DashboardRouters/Wallets'
import { EthereumMessages } from '../../../plugins/Ethereum/messages'

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
            marginTop: theme.spacing(3),
        },
        maxChipRoot: {
            fontSize: 11,
            height: 21,
        },
        maxChipLabel: {
            paddingLeft: 6,
            paddingRight: 6,
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
    const { token, onClose } = props
    const { t } = useI18N()

    const { detailedTokensRetry } = useContext(DashboardWalletsContext)
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')

    // balance
    const { value: tokenBalance = '0', retry: retryTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )

    const onChangeAmount = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const _amount = ev.currentTarget.value
        if (_amount === '') setAmount('')
        if (/^\d+[\.]?\d*$/.test(_amount)) setAmount(_amount)
    }, [])

    //#region transfer tokens
    const transferAmount = new BigNumber(amount || '0').multipliedBy(new BigNumber(10).pow(token.decimals))
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        token.type,
        token.address,
        transferAmount.toFixed(),
        address,
        memo,
    )

    const onTransfer = useCallback(async () => {
        await transferCallback()
    }, [onClose, transferCallback])
    //#endregion

    //#region remote controlled transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (ev.open) return
                resetTransferCallback()
                if (transferState.type !== TransactionStateType.CONFIRMED) return
                onClose()
                detailedTokensRetry()
                retryTokenBalance()
            },
            [transferState.type],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (transferState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: transferState,
            summary: `Transfer ${formatBalance(transferAmount, token.decimals ?? 0)} ${
                token.symbol
            } to ${formatEthereumAddress(address, 4)}.`,
        })
    }, [transferState /* update tx dialog only if state changed */])
    //#endregion

    //#region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || new BigNumber(transferAmount).isZero()) return t('wallet_transfer_error_amount_absence')
        if (new BigNumber(transferAmount).isGreaterThan(new BigNumber(tokenBalance)))
            return t('wallet_transfer_error_insufficent_balance', {
                token: token.symbol,
            })
        if (!address) return t('wallet_transfer_error_address_absence')
        if (!EthereumAddress.isValid(address)) return t('wallet_transfer_error_invalid_address')
        return ''
    }, [transferAmount, address, tokenBalance, token])
    //#endregion

    return (
        <div className={classes.root}>
            <TokenAmountPanel
                amount={amount}
                balance={tokenBalance}
                label={t('wallet_transfer_amount')}
                token={token}
                onAmountChange={setAmount}
                SelectTokenChip={{
                    readonly: true,
                }}
                MaxChipProps={{
                    classes: {
                        root: classes.maxChipRoot,
                        label: classes.maxChipLabel,
                    },
                }}
            />
            <TextField
                required
                label={t('wallet_transfer_to_address')}
                placeholder={t('wallet_transfer_to_address')}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
            />
            <TextField
                label={t('wallet_transfer_memo')}
                placeholder={t('wallet_transfer_memo_placeholder')}
                value={memo}
                disabled={token.type === EthereumTokenType.ERC20}
                onChange={(ev) => setMemo(ev.target.value)}
            />
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                disabled={!!validationMessage || transferState.type === TransactionStateType.WAIT_FOR_CONFIRMING}
                onClick={onTransfer}>
                {validationMessage || t('wallet_transfer_send')}
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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
            <div className={classes.qr}>
                <QRCode
                    text={`ethereum:${wallet.address}`}
                    options={{ width: 200 }}
                    canvasProps={{
                        style: { display: 'block', margin: 'auto' },
                    }}
                />
            </div>
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
                primary={t('wallet_transfer_title')}
                icon={<SendIcon />}
                iconColor="#4EE0BC"
                size="medium"
                content={<AbstractTab height={268} {...tabProps} />}
            />
        </DashboardDialogCore>
    )
}
