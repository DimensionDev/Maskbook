import React, { useState } from 'react'
import { DashboardDialogWrapper } from './Base'
import { CreditCard as CreditCardIcon, Hexagon as HexagonIcon, Clock as ClockIcon } from 'react-feather'
import { Button, TextField, Typography } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'

export function DashboardWalletImportDialog() {
    const [word, setWord] = useState('')
    const [pass, setPass] = useState('')
    const [name, setName] = useState('')

    return (
        <DashboardDialogWrapper
            icon={<CreditCardIcon />}
            iconColor="#4EE0BC"
            primary="Import Wallet"
            secondary="Import a wallet with mnemonic words and password.">
            <form>
                <TextField placeholder="Mnemonic Word*" value={word} onChange={e => setWord(e.target.value)} />
                <TextField placeholder="Password*" value={pass} onChange={e => setPass(e.target.value)} />
                <TextField placeholder="Wallet Name*" value={name} onChange={e => setName(e.target.value)} />
            </form>
            <Button variant="contained" color="primary">
                Import
            </Button>
        </DashboardDialogWrapper>
    )
}

export function DashboardWalletCreateDialog() {
    const [name, setName] = useState('')
    const [pass, setPass] = useState('')

    return (
        <DashboardDialogWrapper icon={<CreditCardIcon />} iconColor="#4EE0BC" primary="Create a Wallet">
            <form>
                <TextField placeholder="Wallet Name*" value={name} onChange={e => setName(e.target.value)} />
                <TextField placeholder="Password*" value={pass} onChange={e => setPass(e.target.value)} />
            </form>
            <Typography variant="body2" color="textSecondary">
                Set a password to improve the security level
            </Typography>
            <Button variant="contained" color="primary">
                Create
            </Button>
        </DashboardDialogWrapper>
    )
}

export function DashboardWalletAddTokenDialog() {
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
        <DashboardDialogWrapper icon={<HexagonIcon />} iconColor="#699CF7" primary="Add token">
            <AbstractTab {...tabProps}></AbstractTab>
            <Button hidden={tabState === 2} variant="contained" color="primary" onClick={console.log}>
                {t('import')}
            </Button>
        </DashboardDialogWrapper>
    )
}

export function DashboardWalletHistoryDialog() {
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
        <DashboardDialogWrapper icon={<ClockIcon />} iconColor="#FB5858" primary="History">
            <AbstractTab {...tabProps}></AbstractTab>
        </DashboardDialogWrapper>
    )
}
