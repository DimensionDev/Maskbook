// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { makeStyles } from '@masknet/theme'
import { memo, useCallback } from 'react'
import { Box, Avatar, Typography, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useNavigate } from 'react-router-dom'
import { formatPersonaFingerprint, type BindingProof } from '@masknet/shared-base'
import { useTheme } from '@mui/system'
import { CopyButton } from '@masknet/shared'
import { TwitterAccount } from './TwitterAccount/index.js'
import { Account } from './Account/index.js'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        background: theme.palette.maskColor.modalTitleBg,
    },
    header: {
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'grid',
        gridTemplateColumns: '24px auto 24px',
        alignItems: 'center',
        flexShrink: 0,
    },
    back: {
        fontSize: 24,
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    info: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
    },
    icon: {
        width: 12,
        height: 12,
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
    accounts: {
        width: '100%',
        display: 'grid',
        justifyContent: 'center',
        padding: '16px',
        gap: '12px',
        gridTemplateColumns: 'repeat(3, 119px)',
    },
    relative: {
        position: 'relative',
    },
}))

export interface FriendsDetailUIProps {
    avatar?: string
    profiles: BindingProof[]
    nextId: string
    publicKey?: string
}

export const FriendsDetailUI = memo<FriendsDetailUIProps>(({ avatar, nextId, publicKey, profiles }) => {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const handleBack = useCallback(() => navigate(-1), [])
    const theme = useTheme()
    return (
        <Box display="flex" flexDirection="column" alignItems="center" width="100%">
            <Box className={classes.container}>
                <Box className={classes.header}>
                    <Icons.Comeback className={classes.back} onClick={handleBack} />
                    <Box />
                    <Icons.Delete className={classes.back} />
                </Box>
                <Box className={classes.info}>
                    <Box>
                        {avatar ? (
                            <Avatar src={avatar} style={{ width: 60, height: 60 }} />
                        ) : (
                            <Icons.NextIdAvatar size={60} style={{ borderRadius: 99 }} />
                        )}
                    </Box>
                    <Typography fontSize={18} fontWeight="700" lineHeight="22px" marginTop="8px">
                        {publicKey ? formatPersonaFingerprint(publicKey, 4) : null}
                    </Typography>
                    <Typography
                        fontSize={12}
                        color={theme.palette.maskColor.second}
                        lineHeight="16px"
                        display="flex"
                        alignItems="center"
                        columnGap="2px">
                        {formatPersonaFingerprint(nextId, 4)}
                        <CopyButton text={nextId} size={12} className={classes.icon} />
                        <Link
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={urlcat('https://web3.bio/', { s: nextId })}
                            className={classes.icon}>
                            <Icons.LinkOut size={12} />
                        </Link>
                    </Typography>
                </Box>
            </Box>
            <Box className={classes.accounts}>
                {profiles.map((profile) => {
                    switch (profile.platform) {
                        case 'twitter':
                            return (
                                <TwitterAccount avatar={''} userId={profile.name ? profile.name : profile.identity} />
                            )
                        case 'ens':
                        case 'ethereum':
                        case 'github':
                        case 'space_id':
                        case 'lens':
                        case 'unstoppabledomains':
                        case 'farcaster':
                            return (
                                <Account
                                    userId={profile.platform === 'ens' ? profile.name : profile.identity}
                                    icon={profile.platform}
                                />
                            )
                        default:
                            return null
                    }
                })}
            </Box>
        </Box>
    )
})
