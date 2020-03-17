import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { Button } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

export default function DashboardPersonasRouter() {
    const actions = useMemo(
        () => [
            <Button color="primary" variant="outlined">
                Restore
            </Button>,
            <Button color="primary" variant="outlined">
                Backup
            </Button>,
            <Button color="primary" variant="contained" endIcon={<AddIcon />}>
                New Persona
            </Button>,
        ],
        [],
    )
    return (
        <DashboardRouterContainer title="My Personas" actions={actions}>
            <div></div>
        </DashboardRouterContainer>
    )
}
