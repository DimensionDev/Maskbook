import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, useTheme, ButtonBase } from '@mui/material'
import { type BindingProof, PopupRoutes, NextIDPlatform } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'
import { TwitterAccount } from '../TwitterAccount/index.js'
import { Account } from '../Account/index.js'
import { safeUnreachable } from '@masknet/kit'

const useStyles = makeStyles()((theme) => ({
    connectedAccounts: {
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        background: theme.palette.maskColor.white,
        padding: '8px',
        position: 'relative',
    },
    more: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        background: 'rgba(28, 104, 243, 0.1)',
        borderRadius: '50%',
        position: 'absolute',
        right: '10px',
    },
}))

interface ConnectedAccountsProps {
    avatar?: string
    profiles: BindingProof[]
    nextId: string
    publicKey?: string
    isLocal?: boolean
}

export const ConnectedAccounts = memo<ConnectedAccountsProps>(function ({
    avatar,
    nextId,
    profiles,
    publicKey,
    isLocal,
}) {
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()

    return (
        <Box
            display="flex"
            gap="8px"
            alignItems="center"
            height="58px"
            className={classes.connectedAccounts}
            width="100%">
            {profiles.slice(0, 2).map((profile) => {
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
            {profiles.length > 2 ? (
                <ButtonBase
                    className={classes.more}
                    onClick={() => {
                        navigate(`${PopupRoutes.FriendsDetail}/${nextId}`, {
                            state: {
                                avatar,
                                publicKey,
                                nextId,
                                profiles,
                                isLocal,
                            },
                        })
                    }}>
                    <Typography fontSize={12} fontWeight={400} lineHeight="16px" color={theme.palette.maskColor.main}>
                        {`+${profiles.length - 2}`}
                    </Typography>
                </ButtonBase>
            ) : null}
        </Box>
    )
})
