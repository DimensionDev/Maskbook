import React, { useState, useMemo } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import { CreditCard as CreditCardIcon, Hexagon as HexagonIcon, Clock as ClockIcon } from 'react-feather'
import { TextField, Typography, makeStyles, createStyles, Paper } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ThrottledButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import Services from '../../service'
import { WalletRecord, EthereumNetwork } from '../../../plugins/Wallet/database/types'
import classNames from 'classnames'
import { ERC20WellKnownTokenSelector } from '../../../plugins/Wallet/UI/Dashboard/Dialogs/WalletAddTokenDialogContent'
import type { ERC20TokenPredefinedData } from '../../../plugins/Wallet/erc20'

export function DashboardWalletImportDialog(props: WrappedDialogProps) {
    const state = useState(0)

    const [mnemonic, setMnemonic] = useState('')
    const [passphrase, setPassphrase] = useState('')
    const [name, setName] = useState('')

    const [privKey, setPrivKey] = useState('')

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Mnemonic  Word',
                children: (
                    <form>
                        <TextField
                            required
                            label="Mnemonic Word"
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                        />
                        <TextField
                            required
                            label="Password"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                        />
                        <TextField
                            required
                            label="Wallet Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </form>
                ),
                p: 0,
            },
            {
                label: 'Private key',
                children: (
                    <form>
                        <TextField
                            required
                            label="Wallet Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            multiline
                            rows={4}
                            required
                            label="Private Key*"
                            value={privKey}
                            onChange={(e) => setPrivKey(e.target.value)}
                        />
                    </form>
                ),
                display: 'flex',
                p: 0,
            },
        ],
        state,
        height: 240,
    }

    const onSubmit = useSnackbarCallback(
        () => {
            if (state[0] === 1)
                return Services.Plugin.invokePlugin('maskbook.wallet', 'importNewWallet', {
                    name,
                    mnemonic: mnemonic.split(' '),
                    passphrase,
                })
            alert('// TODO!: import private key')
            return Promise.reject()
        },
        [name, mnemonic, passphrase],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary="Import Wallet"
                secondary="Import a wallet with mnemonic words and password.">
                <AbstractTab {...tabProps}></AbstractTab>
                <ThrottledButton variant="contained" color="primary" onClick={onSubmit}>
                    Import
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardWalletCreateDialog(props: WrappedDialogProps) {
    const [name, setName] = useState('')
    const [passphrase, setPassphrase] = useState('')

    const onSubmit = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'createNewWallet', { name, passphrase }),
        [name, passphrase],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper icon={<CreditCardIcon />} iconColor="#4EE0BC" primary="Create a Wallet">
                <form>
                    <TextField required label="Wallet Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField
                        required
                        label="Password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                    />
                </form>
                <Typography variant="body2" color="textSecondary">
                    Set a password to improve the security level
                </Typography>
                <ThrottledButton variant="contained" color="primary" onClick={onSubmit}>
                    Create
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

interface WalletProps {
    wallet: WalletRecord
}

export function DashboardWalletAddTokenDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!

    const [token, setToken] = React.useState<null | ERC20TokenPredefinedData[0]>(null)
    const [useRinkeby, setRinkeby] = React.useState(false)

    const [tabState, _setTabState] = useState(0)
    const state = useMemo(
        () =>
            [
                tabState,
                (state: number) => {
                    setToken(null)
                    return _setTabState(state)
                },
            ] as [number, React.Dispatch<React.SetStateAction<number>>],
        [tabState],
    )

    const onSubmit = useSnackbarCallback(
        () =>
            Services.Plugin.invokePlugin(
                'maskbook.wallet',
                'walletAddERC20Token',
                // TODO!: three network?
                wallet.address,
                useRinkeby ? EthereumNetwork.Rinkeby : EthereumNetwork.Mainnet,
                token!,
                tabState === 1,
            ),
        [token, useRinkeby],
        props.onClose,
    )

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Well-know token',
                children: (
                    <ERC20WellKnownTokenSelector onItem={setToken} useRinkebyNetwork={[useRinkeby, setRinkeby]} />
                ),
                p: 0,
            },
            {
                label: 'Add your own',
                children: (
                    <ERC20WellKnownTokenSelector
                        onItem={setToken}
                        useRinkebyNetwork={[useRinkeby, setRinkeby]}
                        isCustom
                    />
                ),
                p: 0,
            },
        ],
        state,
        height: 320,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper icon={<HexagonIcon />} iconColor="#699CF7" primary="Add token">
                <AbstractTab {...tabProps}></AbstractTab>
                <ThrottledButton disabled={!token} variant="contained" color="primary" onClick={onSubmit}>
                    {t('import')}
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardWalletHistoryDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()

    const [name, setName] = useState('')
    const [pass, setPass] = useState('')

    const state = useState(0)
    const [tabState, setTabState] = state

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Inbound',
                children: <></>,
                p: 0,
            },
            {
                label: 'Outbound',
                children: <></>,
                display: 'flex',
                p: 0,
            },
        ],
        state,
        height: 350,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper icon={<ClockIcon />} iconColor="#FB5858" primary="History">
                <AbstractTab {...tabProps}></AbstractTab>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

const useBackupDialogStyles = makeStyles((theme) =>
    createStyles({
        section: {
            textAlign: 'left',
        },
        blockquote: {
            padding: theme.spacing(2, 3),
            backgroundColor: '#FAFAFA',
            border: '1px solid #EAEAEA',
            margin: 'auto',
            lineHeight: '1.71',
        },
        breakAll: {
            wordBreak: 'break-all',
        },
    }),
)

export function DashboardWalletBackupDialog(props: WrappedDialogProps<WalletProps>) {
    const { wallet } = props.ComponentProps!
    const classes = useBackupDialogStyles()
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary="Backup Wallet"
                secondary="Keep the 12 words below carefully in a safe place. You will need them to restore the private key of this wallet.">
                <section className={classes.section}>
                    <Paper elevation={0} className={classes.blockquote} component="blockquote">
                        {wallet.mnemonic.join(' ')}
                    </Paper>
                </section>
                <section className={classes.section}>
                    <Typography color="textSecondary" variant="body2" component="p">
                        Private key
                    </Typography>
                    <Paper
                        elevation={0}
                        className={classNames(classes.breakAll, classes.blockquote)}
                        component="blockquote">
                        // TODO!: private key
                    </Paper>
                </section>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardWalletRenameDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const [name, setName] = useState(wallet.name)
    const onConfirm = useSnackbarCallback(
        () => Services.Plugin.invokePlugin('maskbook.wallet', 'renameWallet', wallet.address, name),
        [wallet.address],
        props.onClose,
    )
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper size="small" primary="Give wallet a new name">
                <TextField
                    required
                    label="Wallet name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <SpacedButtonGroup>
                    <ThrottledButton variant="contained" color="primary" onClick={onConfirm}>
                        OK
                    </ThrottledButton>
                    <ThrottledButton variant="outlined" color="primary" onClick={props.onClose}>
                        Cancel
                    </ThrottledButton>
                </SpacedButtonGroup>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

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
                primary={'Delete Wallet'}
                secondary={'Are you sure? If you do not have backup, you will lose ALL YOUR MONEY of it.'}>
                <SpacedButtonGroup>
                    <ThrottledButton variant="contained" color="danger" onClick={onConfirm}>
                        OK
                    </ThrottledButton>
                    <ThrottledButton variant="outlined" color="primary" onClick={props.onClose}>
                        Cancel
                    </ThrottledButton>
                </SpacedButtonGroup>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
