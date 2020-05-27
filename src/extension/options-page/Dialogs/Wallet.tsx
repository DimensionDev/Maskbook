import React, { useState, useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import { CreditCard as CreditCardIcon, Hexagon as HexagonIcon, Clock as ClockIcon } from 'react-feather'
import {
    TextField,
    Typography,
    makeStyles,
    createStyles,
    List,
    Box,
    FormControlLabel,
    Checkbox,
} from '@material-ui/core'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DebounceButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import ShowcaseBox from '../DashboardComponents/ShowcaseBox'
import Services from '../../service'
import type { WalletRecord, EthereumNetwork, RedPacketRecord } from '../../../plugins/Wallet/database/types'
import {
    ERC20PredefinedTokenSelector,
    ERC20CustomizedTokenSelector,
} from '../../../plugins/Wallet/UI/Dashboard/Dialogs/WalletAddTokenDialogContent'
import type { ERC20Token } from '../../../plugins/Wallet/token'
import { recoverWallet } from '../../../plugins/Wallet/wallet'
import { PluginMessageCenter } from '../../../plugins/PluginMessages'
import WalletLine from '../../../plugins/Wallet/UI/Dashboard/Components/WalletLine'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { ethereumNetworkSettings } from '../../../plugins/Wallet/network'

//#region wallet import dialog
export function DashboardWalletImportDialog(props: WrappedDialogProps) {
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
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet create dialog
interface WalletProps {
    wallet: WalletRecord
}

const useWalletCreateDialogStyle = makeStyles((theme) =>
    createStyles({
        confirmation: {
            fontSize: 16,
            lineHeight: 1.75,
        },
        notification: {
            fontSize: 12,
            fontWeight: 500,
            textAlign: 'center',
            backgroundColor: '#FFD5B3',
            color: 'black',
            padding: '8px 22px',
            margin: '24px -36px 0',
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
        <DashboardDialogCore {...props}>
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
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet add token dialog
export function DashboardWalletAddTokenDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!

    const addedTokens = Array.from(wallet.erc20_token_balance.keys())
    const currentNetwork = useValueRef(ethereumNetworkSettings)
    const [token, setToken] = React.useState<ERC20Token | null>(null)
    const [network, setNetwork] = useState<EthereumNetwork>(currentNetwork)

    const [tabState, setTabState] = useState(0)
    const state = useMemo(
        () =>
            [
                tabState,
                (state: number) => {
                    setToken(null)
                    return setTabState(state)
                },
            ] as [number, React.Dispatch<React.SetStateAction<number>>],
        [tabState],
    )
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Well-know token',
                children: (
                    <ERC20PredefinedTokenSelector
                        token={token}
                        excludeTokens={addedTokens}
                        network={network}
                        onTokenChange={setToken}
                        onNetworkChange={setNetwork}
                    />
                ),
            },
            {
                label: 'Add your own',
                children: (
                    <ERC20CustomizedTokenSelector
                        token={token}
                        excludeTokens={addedTokens}
                        network={network}
                        onTokenChange={setToken}
                        onNetworkChange={setNetwork}
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
                }></DashboardDialogWrapper>
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

export function DashboardWalletHistoryDialog(props: WrappedDialogProps<WalletProps>) {
    const classes = useHistoryDialogStyles()
    const state = useState(0)
    const [tabState] = state

    const { wallet } = props.ComponentProps!

    const [redPacketRecords, setRedPacketRecords] = useState<RedPacketRecord[]>([])
    const inboundRecords = redPacketRecords.filter((record) => record.claim_address === wallet.address)
    const outboundRecords = redPacketRecords.filter((record) => record.sender_address === wallet.address)

    useEffect(() => {
        const updateHandler = () =>
            Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPackets', undefined).then(setRedPacketRecords)

        updateHandler()
        return PluginMessageCenter.on('maskbook.red_packets.update', updateHandler)
    }, [tabState])

    const Record = (record: RedPacketRecord) => (
        <WalletLine
            key={record.id}
            line1={record.send_message}
            line2={`${record.block_creation_time?.toLocaleString()} from ${record.sender_name}`}
            onClick={() => alert('clicked')}
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
                label: 'Inbound',
                children: (
                    <List className={classes.list} disablePadding>
                        {inboundRecords.map(Record)}
                    </List>
                ),
                p: 0,
            },
            {
                label: 'Outbound',
                children: (
                    <List className={classes.list} disablePadding>
                        {outboundRecords.map(Record)}
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
                primary="History"
                content={<AbstractTab {...tabProps}></AbstractTab>}></DashboardDialogWrapper>
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
    const wallet_ = useAsync(() => recoverWallet(wallet.mnemonic, wallet.passphrase))

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
                        {wallet.mnemonic.length ? (
                            <section className={classes.section}>
                                <ShowcaseBox title={t('mnemonic_words')}>{wallet.mnemonic.join(' ')}</ShowcaseBox>
                            </section>
                        ) : null}
                        <section className={classes.section}>
                            <ShowcaseBox title={t('private_key')}>{wallet_.value?.privateKeyInHex}</ShowcaseBox>
                        </section>
                    </>
                }></DashboardDialogWrapper>
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
        <DashboardDialogCore {...props}>
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
                        <DebounceButton variant="outlined" color="primary" onClick={props.onClose}>
                            {t('cancel')}
                        </DebounceButton>
                    </SpacedButtonGroup>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
//#endregion

//#region wallet delete dialog
export function DashboardWalletDeleteConfirmDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const onConfirm = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'removeWallet', wallet.address),
        [wallet.address],
        props.onClose,
    )
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<CreditCardIcon />}
                iconColor="#F4637D"
                primary={t('delete_wallet')}
                secondary={t('delete_wallet_hint')}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="danger" onClick={onConfirm}>
                            {t('confirm')}
                        </DebounceButton>
                        <DebounceButton variant="outlined" color="primary" onClick={props.onClose}>
                            {t('cancel')}
                        </DebounceButton>
                    </SpacedButtonGroup>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
//#endregion
