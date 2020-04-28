import React, { useState } from 'react'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from './Base'
import { CreditCard as CreditCardIcon, Hexagon as HexagonIcon, Clock as ClockIcon } from 'react-feather'
import { TextField, Typography } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ThrottledButton } from '../DashboardComponents/ActionButton'

export function DashboardWalletImportDialog(props: WrappedDialogProps) {
    const state = useState(0)

    const [word, setWord] = useState('')
    const [pass, setPass] = useState('')
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
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                        />
                        <TextField placeholder="Password*" value={pass} onChange={(e) => setPass(e.target.value)} />
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

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary="Import Wallet"
                secondary="Import a wallet with mnemonic words and password.">
                <AbstractTab {...tabProps}></AbstractTab>
                <ThrottledButton variant="contained" color="primary">
                    Import
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardWalletCreateDialog(props: WrappedDialogProps) {
    const [name, setName] = useState('')
    const [pass, setPass] = useState('')

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper icon={<CreditCardIcon />} iconColor="#4EE0BC" primary="Create a Wallet">
                <form>
                    <TextField placeholder="Wallet Name*" value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField placeholder="Password*" value={pass} onChange={(e) => setPass(e.target.value)} />
                </form>
                <Typography variant="body2" color="textSecondary">
                    Set a password to improve the security level
                </Typography>
                <ThrottledButton variant="contained" color="primary">
                    Create
                </ThrottledButton>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
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
