import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, Link, useTheme } from '@mui/material'
import { formatPersonaFingerprint } from '@masknet/shared-base'
import { CopyButton } from '@masknet/shared'
import urlcat from 'urlcat'
import type { FriendsInformation } from '../../../hook/useFriends.js'
import { AccountAvatar } from '../../Personas/components/AccountAvatar/index.js'

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
        background: theme.palette.maskColor.modalTitleBg,
        padding: '12px',
        gap: '8px',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
    },
    icon: {
        width: 12,
        height: 12,
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
    iconBlack: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
    connectedAccounts: {
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        background: theme.palette.maskColor.white,
        padding: '8px',
    },
    userId: {
        display: 'flex',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '18px',
    },
}))

interface ContactCardProps {
    friend: FriendsInformation
}

export const ContactCard = memo<ContactCardProps>(({ friend }) => {
    const theme = useTheme()
    const { classes } = useStyles()
    const { id, avatar, profiles, linkedPersona, identifier } = friend
    return (
        <Box className={classes.card}>
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
            <Box display="flex" alignItems="center" height="58px" className={classes.connectedAccounts}>
                <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
                    <AccountAvatar avatar={avatar} network={identifier.network} isValid />
                    <Box className={classes.userId}>
                        {`@${identifier.userId}`}
                        <Link
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://twitter.com/${identifier.userId}`}
                            className={classes.iconBlack}>
                            <Icons.LinkOut size={16} />
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
})
