import { useMemo, useState, useEffect, useCallback, ChangeEvent, useContext } from 'react'
import { useAsync, useCopyToClipboard } from 'react-use'
import { Send as SendIcon } from 'react-feather'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import {
    CreditCard as CreditCardIcon,
    Hexagon as HexagonIcon,
    Clock as ClockIcon,
    Info as InfoIcon,
    Trash2 as TrashIcon,
} from 'react-feather'
import {
    Button,
    TextField,
    Typography,
    makeStyles,
    createStyles,
    Box,
    FormControlLabel,
    Checkbox,
    Theme,
    Chip,
    InputAdornment,
    IconButton,
} from '@material-ui/core'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import { useHistory } from 'react-router-dom'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton, { DebounceButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import ShowcaseBox from '../DashboardComponents/ShowcaseBox'
import type { RedPacketJSONPayload } from '../../../plugins/RedPacket/types'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { DashboardRoute } from '../Route'
import { sleep, checkInputLengthExceed, unreachable } from '../../../utils/utils'
import { WALLET_OR_PERSONA_NAME_MAX_LEN } from '../../../utils/constants'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ERC20TokenDetailed, ERC721TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { FixedTokenList } from '../DashboardComponents/FixedTokenList'
import { RedPacketInboundList, RedPacketOutboundList } from '../../../plugins/RedPacket/UI/RedPacketList'
import { RedPacket } from '../../../plugins/RedPacket/UI/RedPacket'
import { useRedPacketFromDB } from '../../../plugins/RedPacket/hooks/useRedPacket'
import WalletLine from './WalletLine'
import { isETH, isSameAddress } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { WalletRPC } from '../../../plugins/Wallet/messages'
import { Image } from '../../../components/shared/Image'
import { MaskbookIconOutlined } from '../../../resources/MaskbookIcon'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import BigNumber from 'bignumber.js'
import { EthereumMessages } from '../../../plugins/Ethereum/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { EthereumAddress } from 'wallet.ts'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { QRCode } from '../../../components/shared/qrcode'
import { formatBalance, formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import { useTokenTransferCallback } from '../../../web3/hooks/useTokenTransferCallback'
import { WalletAssetsTableContext } from '../DashboardComponents/WalletAssetsTable'
import { CollectibleContext } from '../DashboardComponents/CollectibleList'

//#region predefined token selector
const useERC20PredefinedTokenSelectorStyles = makeStyles((theme) =>
    createStyles({
        list: {
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        search: {
            marginBottom: theme.spacing(1),
        },
        placeholder: {
            textAlign: 'center',
            paddingTop: theme.spacing(10.5),
            paddingBottom: theme.spacing(10.5),
        },
    }),
)

interface ERC20PredefinedTokenSelectorProps {
    excludeTokens?: string[]
    onTokenChange?: (next: ERC20TokenDetailed | null) => void
}

export function ERC20PredefinedTokenSelector(props: ERC20PredefinedTokenSelectorProps) {
    const { t } = useI18N()
    const classes = useERC20PredefinedTokenSelectorStyles()

    const { onTokenChange, excludeTokens = [] } = props
    const [keyword, setKeyword] = useState('')

    return (
        <Box
            sx={{
                textAlign: 'left',
            }}>
            <TextField
                className={classes.search}
                label={t('add_token_search_hint')}
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                variant="outlined"
            />
            <FixedTokenList
                classes={{ list: classes.list, placeholder: classes.placeholder }}
                keyword={keyword}
                blacklist={excludeTokens}
                onSubmit={(token) => token.type === EthereumTokenType.ERC20 && onTokenChange?.(token)}
                FixedSizeListProps={{
                    height: 192,
                    itemSize: 52,
                    overscanCount: 2,
                }}
            />
        </Box>
    )
}
//#endregion

//#region wallet import dialog
interface WalletProps {
    wallet: WalletRecord
}

const useWalletCreateDialogStyle = makeStyles((theme: Theme) =>
    createStyles({
        confirmation: {
            fontSize: 16,
            lineHeight: 1.75,
            [theme.breakpoints.down('sm')]: {
                fontSize: 14,
            },
        },
        notification: {
            fontSize: 12,
            fontWeight: 500,
            textAlign: 'center',
            backgroundColor: '#FFD5B3',
            color: 'black',
            padding: '8px 22px',
            margin: '24px -36px 0',
            [theme.breakpoints.down('sm')]: {
                margin: '24px -16px 0',
            },
        },
        notificationIcon: {
            width: 16,
            height: 16,
            color: '#FF9138',
        },
    }),
)

export function DashboardWalletCreateDialog(props: WrappedDialogProps<object>) {
    const { t } = useI18N()
    const state = useState(0)
    const classes = useWalletCreateDialogStyle()

    const [name, setName] = useState('')
    const [passphrase] = useState('')
    const [mnemonic, setMnemonic] = useState('')
    const [privKey, setPrivKey] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('wallet_new'),
                children: (
                    <>
                        <form>
                            <TextField
                                helperText={
                                    checkInputLengthExceed(name)
                                        ? t('input_length_exceed_prompt', {
                                              name: t('wallet_name').toLowerCase(),
                                              length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                          })
                                        : undefined
                                }
                                required
                                autoFocus
                                label={t('wallet_name')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                variant="outlined"
                            />
                        </form>
                        <br />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={confirmed}
                                        onChange={() => setConfirmed((confirmed) => !confirmed)}
                                    />
                                }
                                label={
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}>
                                        <Typography className={classes.confirmation} variant="body2">
                                            {t('wallet_confirmation_hint')}
                                        </Typography>
                                    </Box>
                                }
                            />
                            <InfoOutlinedIcon
                                className={classes.notificationIcon}
                                cursor="pointer"
                                onClick={(ev) => {
                                    ev.stopPropagation()
                                    setShowNotification((t) => !t)
                                }}
                            />
                        </Box>
                        {showNotification ? (
                            <Typography className={classes.notification}>{t('wallet_notification')}</Typography>
                        ) : null}
                    </>
                ),
            },
            {
                label: t('mnemonic_words'),
                children: (
                    <div>
                        <TextField
                            helperText={
                                checkInputLengthExceed(name)
                                    ? t('input_length_exceed_prompt', {
                                          name: t('wallet_name').toLowerCase(),
                                          length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                      })
                                    : undefined
                            }
                            required
                            autoFocus
                            label={t('wallet_name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            required
                            label={t('mnemonic_words')}
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                            variant="outlined"
                        />
                    </div>
                ),
                sx: { p: 0 },
            },
            {
                label: t('private_key'),
                children: (
                    <div>
                        <TextField
                            helperText={
                                checkInputLengthExceed(name)
                                    ? t('input_length_exceed_prompt', {
                                          name: t('wallet_name').toLowerCase(),
                                          length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                      })
                                    : undefined
                            }
                            required
                            autoFocus
                            label={t('wallet_name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            type="password"
                            required
                            label={t('private_key')}
                            value={privKey}
                            onChange={(e) => setPrivKey(e.target.value)}
                            variant="outlined"
                        />
                    </div>
                ),
                sx: { display: 'flex', p: 0 },
            },
        ],
        state,
        height: 112,
    }

    const onSubmit = useSnackbarCallback(
        async () => {
            if (state[0] === 0) {
                await WalletRPC.createNewWallet({
                    name,
                    passphrase,
                })
            }
            if (state[0] === 1) {
                await WalletRPC.importNewWallet({
                    name,
                    mnemonic: mnemonic.split(' '),
                    passphrase: '',
                })
            }
            if (state[0] === 2) {
                const { address, privateKeyValid } = await WalletRPC.recoverWalletFromPrivateKey(privKey)
                if (!privateKeyValid) throw new Error(t('import_failed'))
                await WalletRPC.importNewWallet({
                    name,
                    address,
                    _private_key_: privKey,
                })
            }
        },
        [state[0], name, passphrase, mnemonic, privKey],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t(state[0] === 0 ? 'plugin_wallet_on_create' : 'import_wallet')}
                content={<AbstractTab {...tabProps}></AbstractTab>}
                footer={
                    <DebounceButton
                        variant="contained"
                        onClick={onSubmit}
                        disabled={
                            (!(state[0] === 0 && name && confirmed) &&
                                !(state[0] === 1 && name && mnemonic) &&
                                !(state[0] === 2 && name && privKey)) ||
                            checkInputLengthExceed(name)
                        }>
                        {t('create')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet add ERC20 token dialog
export function DashboardWalletAddERC20TokenDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const [token, setToken] = useState<ERC20TokenDetailed | null>(null)

    const onSubmit = useSnackbarCallback(
        async () => {
            if (!token) return
            await Promise.all([WalletRPC.addERC20Token(token), WalletRPC.trustERC20Token(wallet.address, token)])
        },
        [token],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<HexagonIcon />}
                iconColor="#699CF7"
                primary={t('add_token')}
                content={
                    <ERC20PredefinedTokenSelector
                        excludeTokens={Array.from(wallet.erc20_token_whitelist)}
                        onTokenChange={setToken}
                    />
                }
                footer={
                    <DebounceButton disabled={!token} variant="contained" onClick={onSubmit}>
                        {t('add_token')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet backup dialog
const useBackupDialogStyles = makeStyles((theme: Theme) =>
    createStyles({
        section: {
            textAlign: 'left',
        },
    }),
)

export function DashboardWalletBackupDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const classes = useBackupDialogStyles()
    const { value: privateKeyInHex } = useAsync(async () => {
        if (!wallet) return
        const { privateKeyInHex } = wallet._private_key_
            ? await WalletRPC.recoverWalletFromPrivateKey(wallet._private_key_)
            : await WalletRPC.recoverWallet(wallet.mnemonic, wallet.passphrase)
        return privateKeyInHex
    }, [wallet])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t('backup_wallet')}
                secondary={t('backup_wallet_hint')}
                constraintSecondary={false}
                content={
                    <>
                        {wallet?.mnemonic.length ? (
                            <section className={classes.section}>
                                <ShowcaseBox title={t('mnemonic_words')}>{wallet.mnemonic.join(' ')}</ShowcaseBox>
                            </section>
                        ) : null}
                        <section className={classes.section}>
                            <ShowcaseBox title={t('private_key')}>{privateKeyInHex}</ShowcaseBox>
                        </section>
                    </>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet rename dialog
export function DashboardWalletRenameDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const [name, setName] = useState(wallet.name ?? '')
    const renameWallet = useSnackbarCallback(
        () => WalletRPC.renameWallet(wallet.address, name),
        [wallet.address],
        props.onClose,
    )
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                primary={t('wallet_rename')}
                content={
                    <TextField
                        helperText={
                            checkInputLengthExceed(name)
                                ? t('input_length_exceed_prompt', {
                                      name: t('wallet_name').toLowerCase(),
                                      length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                  })
                                : undefined
                        }
                        required
                        autoFocus
                        label={t('wallet_name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        inputProps={{ onKeyPress: (e) => e.key === 'Enter' && renameWallet() }}
                    />
                }
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton
                            variant="contained"
                            onClick={renameWallet}
                            disabled={name.length === 0 || checkInputLengthExceed(name)}>
                            {t('ok')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet delete dialog
export function DashboardWalletDeleteConfirmDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const onConfirm = useSnackbarCallback(
        async () => {
            return WalletRPC.removeWallet(wallet.address)
        },
        [wallet.address],
        props.onClose,
    )
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<CreditCardIcon />}
                iconColor="#F4637D"
                primary={t('delete_wallet')}
                secondary={t('delete_wallet_hint')}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton
                            variant="contained"
                            color="danger"
                            onClick={onConfirm}
                            data-testid="confirm_button">
                            {t('confirm')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region hide wallet token
export function DashboardWalletHideTokenConfirmDialog(
    props: WrappedDialogProps<WalletProps & { token: EtherTokenDetailed | ERC20TokenDetailed | ERC721TokenDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()

    const onConfirm = useSnackbarCallback(
        () => {
            const type = token.type
            switch (type) {
                case EthereumTokenType.Ether:
                    throw new Error('Unable to hide Ether.')
                case EthereumTokenType.ERC20:
                    return WalletRPC.blockERC20Token(wallet.address, token as ERC20TokenDetailed)
                case EthereumTokenType.ERC721:
                    return WalletRPC.blockERC721Token(wallet.address, token as ERC721TokenDetailed)
                default:
                    unreachable(type)
            }
        },
        [wallet.address],
        props.onClose,
    )

    if (isETH(token.address)) return null
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<TrashIcon />}
                iconColor="#F4637D"
                primary={t('hide_token')}
                secondary={t('hide_token_hint', { token: token.name })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="danger" onClick={onConfirm}>
                            {t('confirm')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet error dialog
export function DashboardWalletErrorDialog(props: WrappedDialogProps<object>) {
    const { t } = useI18N()
    const history = useHistory<unknown>()
    const { error } = useQueryParams(['error'])

    let message = ''
    switch (error) {
        case 'nowallet':
            message = t('error_no_wallet')
            break
        case 'Returned error: gas required exceeds allowance (10000000) or always failing transaction':
            message = t('error_gas_feed_exceeds')
            break
        case 'Returned error: insufficient funds for gas * price value':
            message = t('error_insufficient_balance')
            break
        default:
            message = t('error_unknown')
            break
    }

    const onClose = async () => {
        props.onClose()
        // prevent UI updating before dialog disappearing
        await sleep(300)
        history.replace(DashboardRoute.Wallets)
    }

    return (
        <DashboardDialogCore {...props} onClose={onClose}>
            <DashboardDialogWrapper
                size="small"
                icon={<InfoIcon />}
                iconColor="#F4637D"
                primary={t('error_wallet')}
                secondary={message}
                footer={
                    <Button variant="contained" onClick={onClose}>
                        {t('ok')}
                    </Button>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet history dialog
const useHistoryDialogStyles = makeStyles((theme: Theme) =>
    createStyles({
        list: {
            width: '100%',
            overflow: 'auto',
        },
    }),
)

export function DashboardWalletHistoryDialog(
    props: WrappedDialogProps<WalletProps & { onRedPacketClicked: (payload: RedPacketJSONPayload) => void }>,
) {
    const { t } = useI18N()

    const { onRedPacketClicked } = props.ComponentProps!

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('activity_inbound'),
                children: <RedPacketInboundList onSelect={onRedPacketClicked} />,
                sx: { p: 0 },
            },
            {
                label: t('activity_outbound'),
                children: <RedPacketOutboundList onSelect={onRedPacketClicked} />,
                sx: { display: 'flex', p: 0 },
            },
        ],
        state,
        height: 350,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<ClockIcon />}
                iconColor="#FB5858"
                primary={t('activity')}
                content={<AbstractTab {...tabProps}></AbstractTab>}
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region red packet detail dialog
const useRedPacketDetailDialogStyles = makeStyles((theme: Theme) =>
    createStyles({
        sayThanks: {
            display: 'block',
            width: 200,
            margin: `${theme.spacing(2)}px auto`,
        },
        link: {
            display: 'block',
            width: '100%',
            wordBreak: 'break-all',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
    }),
)

export function DashboardWalletRedPacketDetailDialog(
    props: WrappedDialogProps<WalletProps & { payload: RedPacketJSONPayload }>,
) {
    const { wallet, payload } = props.ComponentProps!

    const classes = useRedPacketDetailDialogStyles()

    const account = useAccount()
    const redPacket = useRedPacketFromDB(payload.rpid)

    const sayThanks = useCallback(() => {
        if (!redPacket?.from) return
        if (!redPacket.from!.includes('twitter.com/')) {
            window.open(redPacket.from, '_blank', 'noopener noreferrer')
        } else {
            const user = redPacket.from!.match(/(?!\/)[\d\w]+(?=\/status)/)
            const userText = user ? ` from @${user}` : ''
            const text = [
                `I just received a Red Packet${userText}. Follow @realMaskbook (mask.io) to get your first Twitter #payload.`,
                `#mask_io ${redPacket.from}`,
            ].join('\n')
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                '_blank',
                'noopener noreferrer',
            )
        }
    }, [redPacket])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary="Red Packet Detail"
                content={
                    <>
                        <RedPacket payload={payload} />
                        {redPacket?.from && !isSameAddress(redPacket.payload.sender.address, wallet.address) && (
                            <ActionButton className={classes.sayThanks} onClick={sayThanks} variant="contained">
                                Say Thanks
                            </ActionButton>
                        )}
                        {redPacket?.from && (
                            <WalletLine
                                onClick={() => window.open(redPacket?.from, '_blank', 'noopener noreferrer')}
                                line1="Source"
                                line2={
                                    <Typography className={classes.link} color="primary">
                                        {redPacket?.from || 'Unknown'}
                                    </Typography>
                                }
                            />
                        )}
                        <WalletLine
                            line1="From"
                            line2={
                                <>
                                    {payload.sender.name}{' '}
                                    {isSameAddress(payload.sender.address, account) && (
                                        <Chip label="Me" variant="outlined" color="secondary" size="small" />
                                    )}
                                </>
                            }
                        />
                        <WalletLine line1="Message" line2={payload.sender.message} />
                        <Box
                            sx={{
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <Typography variant="caption" color="textSecondary">
                                Created at {new Date(payload.creation_time).toLocaleString()}
                            </Typography>
                        </Box>
                    </>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

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
    token: EtherTokenDetailed | ERC20TokenDetailed
    onClose: () => void
}

function TransferTab(props: TransferTabProps) {
    const { token, onClose } = props

    const { t } = useI18N()
    const classes = useTransferTabStyles()

    const { detailedTokensRetry } = useContext(WalletAssetsTableContext)
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useTokenBalance(
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
                tokenBalanceRetry()
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
const useReceiveTabStyles = makeStyles((theme: Theme) =>
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
    const classes = useReceiveTabStyles()

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

//#region transfer FT token dialog
export function DashboardWalletTransferDialogFT(
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
//#endregion

//#region transfer NFT token dialog
const useTransferDialogStylesNFT = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
        },
        button: {
            marginTop: theme.spacing(3),
        },
        placeholder: {
            width: 48,
            height: 48,
            opacity: 0.1,
        },
    }),
)

export function DashboardWalletTransferDialogNFT(
    props: WrappedDialogProps<WalletProps & { token: ERC721TokenDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!

    const { t } = useI18N()
    const classes = useTransferDialogStylesNFT()

    const [address, setAddress] = useState('')
    const { collectiblesRetry } = useContext(CollectibleContext)

    //#region transfer tokens
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        token.type,
        token.address,
        token.tokenId,
        address,
    )

    const onTransfer = useCallback(async () => {
        await transferCallback()
    }, [props.onClose, transferCallback])
    //#endregion

    //#region remote controlled transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (ev.open) return
                resetTransferCallback()
                if (transferState.type !== TransactionStateType.CONFIRMED) return
                props.onClose()
                collectiblesRetry()
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
            summary: `Transfer ${token.name} to ${formatEthereumAddress(address, 4)}.`,
        })
    }, [transferState /* update tx dialog only if state changed */])
    //#endregion

    //#region validation
    const validationMessage = useMemo(() => {
        if (!address) return t('wallet_transfer_error_address_absence')
        if (!EthereumAddress.isValid(address)) return t('wallet_transfer_error_invalid_address')
        return ''
    }, [address, token])
    //#endregion

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_title')}
                icon={
                    token.tokenURI ? (
                        <Image
                            component="img"
                            width={160}
                            height={220}
                            style={{ objectFit: 'contain' }}
                            src={token.tokenURI}
                        />
                    ) : (
                        <MaskbookIconOutlined className={classes.placeholder} />
                    )
                }
                size="medium"
                content={
                    <div className={classes.root}>
                        <TextField
                            required
                            label={t('wallet_transfer_to_address')}
                            placeholder={t('wallet_transfer_to_address')}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            disabled={!address}
                            onClick={onTransfer}>
                            {validationMessage || t('wallet_transfer_send')}
                        </Button>
                    </div>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion
