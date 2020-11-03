import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAsync, useCopyToClipboard } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import {
    CreditCard as CreditCardIcon,
    Hexagon as HexagonIcon,
    Clock as ClockIcon,
    Info as InfoIcon,
    Trash2 as TrashIcon,
    Share2 as ShareIcon,
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
    InputAdornment,
    IconButton,
    Chip,
} from '@material-ui/core'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { useHistory } from 'react-router-dom'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton, { DebounceButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import ShowcaseBox from '../DashboardComponents/ShowcaseBox'
import Services from '../../service'
import type { RedPacketJSONPayload } from '../../../plugins/RedPacket/types'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { DashboardRoute } from '../Route'
import { sleep, checkInputLengthExceed } from '../../../utils/utils'
import { WALLET_OR_PERSONA_NAME_MAX_LEN } from '../../../utils/constants'
import { QRCode } from '../../../components/shared/qrcode'
import type { WalletRecord, ERC20TokenRecord } from '../../../plugins/Wallet/database/types'
import { useChainId } from '../../../web3/hooks/useChainState'
import { Token, EthereumTokenType } from '../../../web3/types'
import { useWallet } from '../../../plugins/Wallet/hooks/useWallet'
import { FixedTokenList } from '../DashboardComponents/FixedTokenList'
import { RedPacketInboundList, RedPacketOutboundList } from '../../../plugins/RedPacket/UI/RedPacketList'
import { RedPacket } from '../../../plugins/RedPacket/UI/RedPacket'
import { useRedPacketFromDB } from '../../../plugins/RedPacket/hooks/useRedPacket'
import WalletLine from './WalletLine'
import { isSameAddress } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'

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
            paddingTop: theme.spacing(10),
        },
    }),
)

interface ERC20PredefinedTokenSelectorProps {
    excludeTokens?: string[]
    onTokenChange?: (next: Token | null) => void
}

export function ERC20PredefinedTokenSelector(props: ERC20PredefinedTokenSelectorProps) {
    const { t } = useI18N()
    const classes = useERC20PredefinedTokenSelectorStyles()

    const { onTokenChange, excludeTokens = [] } = props
    const [keyword, setKeyword] = useState('')

    return (
        <Box textAlign="left">
            <TextField
                className={classes.search}
                label={t('add_token_search_hint')}
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />
            <FixedTokenList
                classes={{ list: classes.list, placeholder: classes.placeholder }}
                keyword={keyword}
                excludeTokens={excludeTokens}
                onSubmit={onTokenChange}
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

//#region ERC20 customized token selector
export interface ERC20CustomizedTokenSelectorProps {
    onTokenChange?: (next: Token | null) => void
    excludeTokens?: string[]
}

export function ERC20CustomizedTokenSelector({ onTokenChange, ...props }: ERC20CustomizedTokenSelectorProps) {
    const { t } = useI18N()
    const chainId = useChainId()
    const [address, setAddress] = useState('')
    const [decimals, setDecimals] = useState(0)
    const [name, setName] = useState('')
    const [symbol, setSymbol] = useState('')
    const isValidAddress = EthereumAddress.isValid(address)

    useEffect(() => {
        if (isValidAddress)
            onTokenChange?.({
                type: EthereumTokenType.ERC20,
                chainId,
                address,
                decimals,
                name,
                symbol,
            })
        else onTokenChange?.(null)
    }, [chainId, address, decimals, isValidAddress, name, symbol, onTokenChange])
    return (
        <Box textAlign="left">
            <TextField
                required
                autoFocus
                label={t('add_token_contract_address')}
                error={!isValidAddress && !!address}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
                required
                label={t('add_token_decimals')}
                value={decimals === 0 ? '' : decimals}
                type="number"
                inputProps={{ min: 0 }}
                onChange={(e) => setDecimals(parseInt(e.target.value))}
            />
            <TextField required label={t('add_token_name')} value={name} onChange={(e) => setName(e.target.value)} />
            <TextField
                required
                label={t('add_token_symbol')}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
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
                            />
                        </form>
                        <br />
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={confirmed}
                                        onChange={() => setConfirmed((confirmed) => !confirmed)}
                                    />
                                }
                                label={
                                    <Box display="inline-flex" alignItems="center">
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
                        />
                        <TextField
                            required
                            label={t('mnemonic_words')}
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                        />
                    </div>
                ),
                p: 0,
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
                        />
                        <TextField
                            type="password"
                            required
                            label={t('private_key')}
                            value={privKey}
                            onChange={(e) => setPrivKey(e.target.value)}
                        />
                    </div>
                ),
                display: 'flex',
                p: 0,
            },
        ],
        state,
        height: 112,
    }

    const onSubmit = useSnackbarCallback(
        async () => {
            if (state[0] === 0) {
                const address = await Services.Plugin.invokePlugin('maskbook.wallet', 'createNewWallet', {
                    name,
                    passphrase,
                })
                setAsSelectedWallet(address)
            }
            if (state[0] === 1) {
                const address = await Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', {
                    name,
                    mnemonic: mnemonic.split(' '),
                    passphrase: '',
                })
                setAsSelectedWallet(address)
            }
            if (state[0] === 2) {
                const { address, privateKeyValid } = await Services.Plugin.invokePlugin(
                    'maskbook.wallet',
                    'recoverWalletFromPrivateKey',
                    privKey,
                )
                setAsSelectedWallet(address)
                if (!privateKeyValid) throw new Error(t('import_failed'))
                await Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', {
                    name,
                    address,
                    _private_key_: privKey,
                })
            }
            function setAsSelectedWallet(address: string) {
                if (!address) return
                currentSelectedWalletAddressSettings.value = address
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
                primary={t(state[0] === 0 ? 'create_wallet' : 'import_wallet')}
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
                        {t('import')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet share dialog
const useWalletShareDialogStyle = makeStyles((theme: Theme) =>
    createStyles({
        qr: {
            marginTop: theme.spacing(3),
        },
    }),
)

export function DashboardWalletShareDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const classes = useWalletShareDialogStyle()
    const { wallet } = props.ComponentProps!

    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<ShareIcon />}
                iconColor="#4EE0BC"
                primary={t('share_wallet')}
                secondary={t('share_wallet_hint')}
                content={
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
                            />
                        </form>
                        <Box className={classes.qr} display="flex" justifyContent="center" alignItems="center">
                            <QRCode
                                text={`ethereum:${wallet.address}`}
                                options={{ width: 200 }}
                                canvasProps={{
                                    style: { display: 'block', margin: 'auto' },
                                }}
                            />
                        </Box>
                    </>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet add token dialog
export function DashboardWalletAddTokenDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const [token, setToken] = React.useState<Token | null>(null)

    const [tabState, setTabState] = useState(0)
    const state = useMemo(
        () =>
            [
                tabState,
                (state: number) => {
                    setToken(null)
                    return setTabState(state)
                },
            ] as const,
        [tabState],
    )
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('add_token_well_known'),
                children: (
                    <ERC20PredefinedTokenSelector
                        excludeTokens={Array.from(wallet.erc20_token_whitelist)}
                        onTokenChange={setToken}
                    />
                ),
            },
            {
                label: t('add_token_your_own'),
                children: (
                    <ERC20CustomizedTokenSelector
                        excludeTokens={Array.from(wallet.erc20_token_whitelist)}
                        onTokenChange={setToken}
                    />
                ),
            },
        ],
        state,
        height: 240,
    }
    const onSubmit = useSnackbarCallback(
        async () => {
            if (!token) return
            await Promise.all([
                Services.Plugin.invokePlugin('maskbook.wallet', 'addERC20Token', token),
                Services.Plugin.invokePlugin('maskbook.wallet', 'trustERC20Token', wallet.address, token),
            ])
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
                content={<AbstractTab {...tabProps}></AbstractTab>}
                footer={
                    <DebounceButton disabled={!token} variant="contained" onClick={onSubmit}>
                        {t('import')}
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
    const {
        wallet: { address },
    } = props.ComponentProps!
    const classes = useBackupDialogStyles()
    const wallet = useWallet(address)
    const { value: privateKeyInHex } = useAsync(async () => {
        if (!wallet) return
        const { privateKeyInHex } = wallet._private_key_
            ? await Services.Plugin.invokePlugin('maskbook.wallet', 'recoverWalletFromPrivateKey', wallet._private_key_)
            : await Services.Plugin.invokePlugin('maskbook.wallet', 'recoverWallet', wallet.mnemonic, wallet.passphrase)
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
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'renameWallet', wallet.address, name),
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
                        variant="outlined"
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
            return Services.Plugin.invokePlugin('maskbook.wallet', 'removeWallet', wallet.address)
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
    props: WrappedDialogProps<WalletProps & { token: ERC20TokenRecord }>,
) {
    const { t } = useI18N()
    const { wallet, token } = props.ComponentProps!
    const onConfirm = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'blockERC20Token', wallet.address, token),
        [wallet.address],
        props.onClose,
    )
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
    const classes = useHistoryDialogStyles()

    const { wallet, onRedPacketClicked } = props.ComponentProps!

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('activity_inbound'),
                children: <RedPacketInboundList from={wallet.address} onSelect={onRedPacketClicked} />,
                p: 0,
            },
            {
                label: t('activity_outbound'),
                children: <RedPacketOutboundList from={wallet.address} onSelect={onRedPacketClicked} />,
                display: 'flex',
                p: 0,
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
const useRedPacketDetailStyles = makeStyles((theme: Theme) =>
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
    const { t } = useI18N()
    const { wallet, payload } = props.ComponentProps!

    const classes = useRedPacketDetailStyles()

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
                `#maskbook ${redPacket.from}`,
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
                        <RedPacket from={wallet.address} payload={payload} />
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
                        <Box p={1} display="flex" justifyContent="center">
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
