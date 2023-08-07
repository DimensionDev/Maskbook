import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { type BindingProof } from '@masknet/shared-base'
import { AccountRender } from '../../AccountRender/index.js'

const useStyles = makeStyles()((theme) => ({
    accounts: {
        width: '100%',
        display: 'grid',
        justifyContent: 'center',
        padding: '16px',
        gap: '12px',
        gridTemplateColumns: 'repeat(3, 119px)',
    },
}))

interface ConnectedAccountsProps {
    profiles: BindingProof[]
}

export const ConnectedAccounts = memo<ConnectedAccountsProps>(function ConnectedAccounts({ profiles }) {
    const { classes } = useStyles()

    return (
        <Box display="flex" gap="8px" alignItems="center" height="58px" className={classes.accounts} width="100%">
            {profiles.map((profile) => {
                return <AccountRender key={profile.platform} profile={profile} detail />
            })}
        </Box>
    )
})
