import React, { useState } from 'react'
import { DashboardDialogWrapper } from './Base'
import { CreditCard as CreditCardIcon } from 'react-feather'
import { Button, TextField, Typography } from '@material-ui/core'

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
