import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, Link, useTheme, ButtonBase as Button, ButtonBase } from '@mui/material'
import { formatPersonaFingerprint } from '@masknet/shared-base'
import { CopyButton } from '@masknet/shared'
import urlcat from 'urlcat'
import type { FriendsInformation } from '../../../hook/useFriends.js'
import { AccountAvatar } from '../../Personas/components/AccountAvatar/index.js'
import { useNavigate } from 'react-router-dom'
import { TwitterAccount } from '../TwitterAccount/index.js'
import { LensAccount } from '../LensAccount/index.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: theme.palette.maskColor.line,
    },
    title: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    titleWrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        background: theme.palette.maskColor.modalTitleBg,
    },
    icon: {
        width: 12,
        height: 12,
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
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

interface ContactCardProps {
    friend: FriendsInformation
}

export const ContactCard = memo<ContactCardProps>(({ friend }) => {
    const theme = useTheme()
    const { classes } = useStyles()
    const { id, avatar, profiles, linkedPersona, identifier } = friend
    const navigate = useNavigate()
    return (
        <Box className={classes.card}>
            <Box className={classes.titleWrap}>
                <Box className={classes.title}>
                    <AccountAvatar avatar={avatar} />
                    <Box>
                        <Typography fontSize={14} fontWeight={700} lineHeight="18px">
                            {linkedPersona ? formatPersonaFingerprint(linkedPersona.rawPublicKey, 4) : null}
                        </Typography>
                        <Typography
                            fontSize={12}
                            color={theme.palette.maskColor.second}
                            lineHeight="16px"
                            display="flex"
                            alignItems="center"
                            columnGap="2px">
                            {formatPersonaFingerprint(id, 4)}
                            <CopyButton text={id} size={12} className={classes.icon} />
                            <Link
                                underline="none"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={urlcat('https://web3.bio/', { s: id })}
                                className={classes.icon}>
                                <Icons.LinkOut size={12} />
                            </Link>
                        </Typography>
                    </Box>
                </Box>
                <Button onClick={() => navigate('/friends/detail')} color="inherit" style={{ borderRadius: '50%' }}>
                    <Icons.ArrowRight />
                </Button>
            </Box>
            <Box
                display="flex"
                gap="12px"
                alignItems="center"
                height="58px"
                className={classes.connectedAccounts}
                width="100%">
                {profiles.slice(0, 2).map((profile) => {
                    switch (profile.platform) {
                        case 'twitter':
                            return <TwitterAccount avatar={''} userId={profile.name} />
                        case 'lens':
                            return <LensAccount userId={profile.identity} />
                        default:
                            return null
                    }
                })}
                {profiles.length > 2 ? (
                    <ButtonBase className={classes.more}>
                        <Typography
                            fontSize={12}
                            fontWeight={400}
                            lineHeight="16px"
                            color={theme.palette.maskColor.main}>
                            {' '}
                            {`+${profiles.length - 2}`}
                        </Typography>
                    </ButtonBase>
                ) : null}
            </Box>
        </Box>
    )
})
