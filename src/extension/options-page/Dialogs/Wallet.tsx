import React, { useState, useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
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
    List,
    Box,
    FormControlLabel,
    Checkbox,
    Chip,
} from '@material-ui/core'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton, { DebounceButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import ShowcaseBox from '../DashboardComponents/ShowcaseBox'
import Services from '../../service'
import type { RedPacketRecord, ERC20TokenRecord } from '../../../plugins/Wallet/database/types'
import {
    ERC20PredefinedTokenSelector,
    ERC20CustomizedTokenSelector,
} from '../../../plugins/Wallet/UI/Dashboard/Dialogs/WalletAddTokenDialog'
import type { ERC20Token } from '../../../plugins/Wallet/token'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import WalletLine from '../../../plugins/Wallet/UI/Dashboard/Components/WalletLine'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useHistory } from 'react-router-dom'
import { DashboardRoute } from '../Route'
import { sleep } from '../../../utils/utils'
import { currentEthereumNetworkSettings } from '../../../settings/settings'
import type { WalletDetails, ERC20TokenDetails } from '../../background-script/PluginService'
import { useManagedWalletDetail } from '../../../plugins/shared/useWallet'
import { difference } from 'lodash-es'
import { RedPacket } from '../../../plugins/Wallet/UI/Dashboard/Components/RedPacket'

//#region wallet import dialog
export function DashboardWalletImportDialog(props: WrappedDialogProps<object>) {
    const { t } = useI18N()
    const state = useState(0)

    const [name, setName] = useState('')
    const [mnemonic, setMnemonic] = useState('')
    const [privKey, setPrivKey] = useState('')

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('mnemonic_words'),
                children: (
                    <div>
                        <TextField
                            required
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
                            required
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
        () => {
            if (state[0] === 0)
                return Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', {
                    name,
                    mnemonic: mnemonic.split(' '),
                    passphrase: '',
                })
            return Services.Plugin.invokePlugin(
                'maskbook.wallet',
                'recoverWalletFromPrivateKey',
                privKey,
            ).then(({ address }) =>
                Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', { name, address }),
            )
        },
        [name, mnemonic],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t('import_wallet')}
                content={<AbstractTab {...tabProps}></AbstractTab>}
                footer={
                    <DebounceButton
                        variant="contained"
                        color="primary"
                        onClick={onSubmit}
                        disabled={!(state[0] === 0 && name && mnemonic) && !(state[0] === 1 && name && privKey)}>
                        {t('import')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet create dialog
interface WalletProps {
    wallet: WalletDetails
}

const useWalletCreateDialogStyle = makeStyles((theme) =>
    createStyles({
        confirmation: {
            fontSize: 16,
            lineHeight: 1.75,
            [theme.breakpoints.down('xs')]: {
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
            [theme.breakpoints.down('xs')]: {
                margin: '24px -16px 0',
            },
        },
        notificationIcon: {
            width: 16,
            height: 16,
            color: '#FF9138',
            marginLeft: 5,
        },
    }),
)

export function DashboardWalletCreateDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useWalletCreateDialogStyle()

    const [name, setName] = useState('')
    const [passphrase] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    const onSubmit = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'createNewWallet', { name, passphrase }),
        [name, passphrase],
        props.onClose,
    )

    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t('create_a_wallet')}
                content={
                    <>
                        <form>
                            <TextField
                                required
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
                                        <InfoOutlinedIcon
                                            className={classes.notificationIcon}
                                            cursor="pointer"
                                            onClick={() => setShowNotification((t) => !t)}
                                        />
                                    </Box>
                                }
                            />
                        </Box>
                        {showNotification ? (
                            <Typography className={classes.notification}>{t('wallet_notification')}</Typography>
                        ) : null}
                    </>
                }
                footer={
                    <DebounceButton
                        variant="contained"
                        color="primary"
                        onClick={onSubmit}
                        disabled={!name || !confirmed}>
                        {t('create')}
                    </DebounceButton>
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

    const addedTokens = difference(
        Array.from(wallet.erc20_token_balance.keys()),
        Array.from(wallet.erc20_token_blacklist.values()),
    )
    const network = useValueRef(currentEthereumNetworkSettings)
    const [token, setToken] = React.useState<ERC20Token | null>(null)

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
                children: <ERC20PredefinedTokenSelector excludeTokens={addedTokens} onTokenChange={setToken} />,
            },
            {
                label: t('add_token_your_own'),
                children: <ERC20CustomizedTokenSelector excludeTokens={addedTokens} onTokenChange={setToken} />,
            },
        ],
        state,
        height: 240,
    }
    const onSubmit = useSnackbarCallback(
        async () => {
            if (!token) return
            return Services.Plugin.invokePlugin(
                'maskbook.wallet',
                'walletAddERC20Token',
                wallet.address,
                network,
                token,
                tabState === 1,
            )
        },
        [token, network],
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
                    <DebounceButton disabled={!token} variant="contained" color="primary" onClick={onSubmit}>
                        {t('import')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet backup dialog
const useBackupDialogStyles = makeStyles((theme) =>
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
    const { data } = useManagedWalletDetail(wallet.address)
    const { value: privateKeyInHex } = useAsync(async () => {
        if (!data) return
        const { privateKeyInHex } = await Services.Plugin.invokePlugin(
            'maskbook.wallet',
            'recoverWallet',
            data.mnemonic,
            data.passphrase,
        )
        return privateKeyInHex
    }, [data])

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
                        {data?.mnemonic.length ? (
                            <section className={classes.section}>
                                <ShowcaseBox title={t('mnemonic_words')}>{data.mnemonic.join(' ')}</ShowcaseBox>
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
                primary={t('wallet_new_name')}
                content={
                    <TextField
                        required
                        label={t('wallet_name')}
                        variant="outlined"
                        value={name}
                        autoFocus
                        onChange={(e) => setName(e.target.value)}
                        inputProps={{ onKeyPress: (e) => e.key === 'Enter' && renameWallet() }}
                    />
                }
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="primary" onClick={renameWallet}>
                            {t('ok')}
                        </DebounceButton>
                        <DebounceButton variant="outlined" color="default" onClick={props.onClose}>
                            {t('cancel')}
                        </DebounceButton>
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
            await Services.Plugin.invokePlugin('maskbook.wallet', 'unwatchWalletBalances', wallet.address)
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
                        <DebounceButton variant="outlined" color="default" onClick={props.onClose}>
                            {t('cancel')}
                        </DebounceButton>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region hide wallet token
export function DashboardWalletHideTokenConfirmDialog(
    props: WrappedDialogProps<WalletProps & { token: ERC20TokenDetails }>,
) {
    const { t } = useI18N()
    const { wallet, token } = props.ComponentProps!
    const onConfirm = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'walletBlockERC20Token', wallet.address, token.address),
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
                        <DebounceButton variant="outlined" color="default" onClick={props.onClose}>
                            {t('cancel')}
                        </DebounceButton>
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
                    <Button variant="contained" color="primary" onClick={onClose}>
                        {t('ok')}
                    </Button>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet history dialog
const useHistoryDialogStyles = makeStyles((theme) =>
    createStyles({
        list: {
            width: '100%',
            overflow: 'auto',
        },
    }),
)

export function DashboardWalletHistoryDialog(
    props: WrappedDialogProps<WalletProps & { onClickRedPacketRecord: (redPacket: RedPacketRecord) => void }>,
) {
    const { t } = useI18N()
    const classes = useHistoryDialogStyles()
    const state = useState(0)
    const [tabState] = state

    const { wallet, onClickRedPacketRecord } = props.ComponentProps!

    const [redPacketRecords, setRedPacketRecords] = useState<RedPacketRecord[]>([])
    const inboundRecords = redPacketRecords.filter((record) => record.claim_address === wallet.address)
    const outboundRecords = redPacketRecords.filter((record) => record.sender_address === wallet.address)

    useEffect(() => {
        const updateHandler = () =>
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets', undefined).then(setRedPacketRecords)
        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [tabState])

    const RedPacketRecord = (record: RedPacketRecord) => (
        <WalletLine
            key={record.id}
            line1={record.send_message}
            line2={`${record.block_creation_time?.toLocaleString()} from ${record.sender_name}`}
            onClick={() => {
                props.onClose()
                onClickRedPacketRecord(record)
            }}
            invert
            action={
                <Typography variant="h6">
                    {(tabState === 0 && record.claim_amount) || (tabState === 1 && record.send_total)
                        ? formatBalance(
                              tabState === 0 ? record.claim_amount! : record.send_total,
                              record.raw_payload?.token?.decimals ?? 18,
                          )
                        : '0'}{' '}
                    {record.raw_payload?.token?.name || 'ETH'}
                </Typography>
            }
        />
    )
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('history_inbound'),
                children: (
                    <List className={classes.list} disablePadding>
                        {inboundRecords.map(RedPacketRecord)}
                    </List>
                ),
                p: 0,
            },
            {
                label: t('history_outbound'),
                children: (
                    <List className={classes.list} disablePadding>
                        {outboundRecords.map(RedPacketRecord)}
                    </List>
                ),
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
                primary={t('history')}
                content={<AbstractTab {...tabProps}></AbstractTab>}
            />
        </DashboardDialogCore>
    )
}
//#endregion

//#region red packet detail dialog
const useRedPacketDetailStyles = makeStyles((theme) =>
    createStyles({
        openBy: {
            margin: theme.spacing(2, 0, 0.5),
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

interface RedPacketProps {
    redPacket: RedPacketRecord
}

export function DashboardWalletRedPacketDetailDialog(props: WrappedDialogProps<RedPacketProps>) {
    const { t } = useI18N()
    const { redPacket } = props.ComponentProps!

    const classes = useRedPacketDetailStyles()
    const sayThanks = () => {
        if (!redPacket._found_in_url_!.includes('twitter.com/')) {
            window.open(redPacket._found_in_url_, '_blank', 'noopener noreferrer')
        } else {
            const user = redPacket._found_in_url_!.match(/(?!\/)[\d\w]+(?=\/status)/)
            const userText = user ? ` from @${user}` : ''
            const text = [
                `I just received a Red Packet${userText}. Follow @realMaskbook (maskbook.com) to get your first Twitter #RedPacket.`,
                `#maskbook ${redPacket._found_in_url_}`,
            ].join('\n')
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                '_blank',
                'noopener noreferrer',
            )
        }
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary="Red Packet Detail"
                content={
                    <>
                        <RedPacket redPacket={redPacket} />
                        {redPacket._found_in_url_ && (
                            <ActionButton
                                onClick={sayThanks}
                                style={{ display: 'block', margin: 'auto', width: 200 }}
                                variant="contained"
                                color="primary">
                                Say Thanks
                            </ActionButton>
                        )}
                        {redPacket._found_in_url_ && (
                            <WalletLine
                                onClick={() => window.open(redPacket._found_in_url_, '_blank', 'noopener noreferrer')}
                                line1="Source"
                                line2={
                                    <Typography className={classes.link} color="primary">
                                        {redPacket._found_in_url_ || 'Unknown'}
                                    </Typography>
                                }
                            />
                        )}
                        <WalletLine
                            line1="From"
                            line2={
                                <>
                                    {redPacket.sender_name}{' '}
                                    {redPacket.create_transaction_hash && (
                                        <Chip label="Me" variant="outlined" color="secondary" size="small" />
                                    )}
                                </>
                            }
                        />
                        <WalletLine line1="Message" line2={redPacket.send_message} />
                        <Box p={1} display="flex" justifyContent="center">
                            <Typography variant="caption" color="textSecondary">
                                Created at {redPacket.block_creation_time?.toLocaleString()}
                            </Typography>
                        </Box>
                    </>
                }
            />
        </DashboardDialogCore>
    )
}

//#endregion
