import React, { useState } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import { CreditCard as CreditCardIcon, Hexagon as HexagonIcon, Clock as ClockIcon } from 'react-feather'
import { TextField, Typography } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ThrottledButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import Services from '../../service'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'

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
                            placeholder="Mnemonic Word*"
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                        />
                        <TextField
                            placeholder="Password*"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                        />
                        <TextField placeholder="Wallet Name*" value={name} onChange={(e) => setName(e.target.value)} />
                    </form>
                ),
                p: 0,
            },
            {
                label: 'Private key',
                children: (
                    <form>
                        <TextField placeholder="Wallet Name*" value={name} onChange={(e) => setName(e.target.value)} />
                        <TextField
                            multiline
                            rows={4}
                            placeholder="Private Key*"
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
                    <TextField placeholder="Wallet Name*" value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField
                        placeholder="Password*"
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

export function DashboardWalletAddTokenDialog(props: WrappedDialogProps) {
    const { t } = useI18N()

    const [name, setName] = useState('')
    const [pass, setPass] = useState('')

    const state = useState(0)
    const [tabState, setTabState] = state

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Well-know token',
                children: <></>,
                p: 0,
            },
            {
                label: 'Add your own',
                children: <></>,
                display: 'flex',
                p: 0,
            },
        ],
        state,
        height: 240,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper icon={<HexagonIcon />} iconColor="#699CF7" primary="Add token">
                <AbstractTab {...tabProps}></AbstractTab>
                <ThrottledButton hidden={tabState === 2} variant="contained" color="primary" onClick={console.log}>
                    {t('import')}
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardWalletHistoryDialog(props: WrappedDialogProps) {
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

export function DashboardWalletBackupDialog(props: WrappedDialogProps) {
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary="Backup Wallet"
                secondary="Keep the 12 words below carefully in a safe place. You will need them to restore the private key of this wallet.">
                <section>
                    <blockquote>
                        utility require remember merge cram carbon hungry force series minimum entire remove
                    </blockquote>
                </section>
                <section>
                    <Typography variant="body2">Private key</Typography>
                    <blockquote>0x1a3car70f81c1f812b9b84711a99c62fe7c986a9db174e3ffc180cfdcbbf9933</blockquote>
                </section>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardWalletDeleteConfirmDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const { wallet } = props.ComponentProps!
    const deletePersona = useSnackbarCallback(
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
                    <ThrottledButton variant="contained" color="danger" onClick={deletePersona}>
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
