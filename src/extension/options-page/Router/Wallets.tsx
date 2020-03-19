import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

export default function DashboardWalletsRouter() {
    const actions = useMemo(
        () => [
            <Button color="primary" variant="outlined">
                Import
            </Button>,
            <Button color="primary" variant="contained" endIcon={<AddIcon />}>
                Create Wallet
            </Button>,
        ],
        [],
    )
    return (
        <DashboardRouterContainer padded={false} title="My Wallets" actions={actions}>
            <div></div>
        </DashboardRouterContainer>
    )
}
