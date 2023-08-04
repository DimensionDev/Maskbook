import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { type BindingProof, NextIDPlatform } from '@masknet/shared-base'
import { TwitterAccount } from '../TwitterAccount/index.js'
import { Account } from '../Account/index.js'
import { safeUnreachable } from '@masknet/kit'

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

export const ConnectedAccounts = memo<ConnectedAccountsProps>(({ profiles }) => {
    const { classes } = useStyles()

    return (
        <Box display="flex" gap="8px" alignItems="center" height="58px" className={classes.accounts} width="100%">
            {profiles.map((profile) => {
                switch (profile.platform) {
                    case NextIDPlatform.Twitter:
                        return <TwitterAccount avatar={''} userId={profile.name ? profile.name : profile.identity} />
                    case NextIDPlatform.ENS:
                    case NextIDPlatform.Ethereum:
                    case NextIDPlatform.GitHub:
                    case NextIDPlatform.SpaceId:
                    case NextIDPlatform.LENS:
                    case NextIDPlatform.Unstoppable:
                    case NextIDPlatform.Farcaster:
                        return (
                            <Account
                                userId={profile.platform === NextIDPlatform.ENS ? profile.name : profile.identity}
                                icon={profile.platform}
                            />
                        )
                    case NextIDPlatform.CyberConnect:
                    case NextIDPlatform.Bit:
                    case NextIDPlatform.SYBIL:
                    case NextIDPlatform.Keybase:
                    case NextIDPlatform.EthLeaderboard:
                    case NextIDPlatform.REDDIT:
                    case NextIDPlatform.RSS3:
                    case NextIDPlatform.NextID:
                        return null
                    default:
                        safeUnreachable(profile.platform)
                        return null
                }
            })}
        </Box>
    )
})
