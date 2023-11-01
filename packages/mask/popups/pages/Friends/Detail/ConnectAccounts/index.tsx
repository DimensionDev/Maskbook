import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { AccountRender } from '../../AccountRender/index.js'
import { RestorableScroll } from '@masknet/shared'
import type { Profile } from '../../common.js'
import type { ProfileIdentifier } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    accounts: {
        width: '100%',
        display: 'grid',
        justifyContent: 'center',
        padding: '16px',
        gap: '12px',
        gridTemplateColumns: 'repeat(3, 119px)',
        overflowY: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface ConnectedAccountsProps {
    profiles: Profile[]
    localProfile?: ProfileIdentifier
    avatar?: string
}

export const ConnectedAccounts = memo<ConnectedAccountsProps>(function ConnectedAccounts({
    profiles,
    localProfile,
    avatar,
}) {
    const { classes } = useStyles()
    return (
        <RestorableScroll scrollKey="connected_accounts">
            <Box className={classes.accounts}>
                {profiles.map((profile) => {
                    return (
                        <AccountRender
                            key={profile.identity}
                            profile={profile}
                            detail
                            avatar={localProfile?.userId === (profile.name ?? profile.identity) ? avatar : ''}
                        />
                    )
                })}
            </Box>
        </RestorableScroll>
    )
})
