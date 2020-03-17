import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { TextField, InputAdornment } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'

export default function DashboardContactsRouter() {
    const actions = useMemo(
        () => [
            <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />,
        ],
        [],
    )
    return (
        <DashboardRouterContainer title="Contacts" actions={actions}>
            <div></div>
        </DashboardRouterContainer>
    )
}
