import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { AccountAvatar } from '../../../Personas/components/AccountAvatar/index.js'
import { makeStyles } from '@masknet/theme'
import { type EnhanceableSite } from '@masknet/shared-base'

interface SocialAccountProps {
    avatar: string
    userId: string
    site: EnhanceableSite
}

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '119px',
        height: '86px',
        borderRadius: '8px',
        ':hover': {
            boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        },
    },
    iconBlack: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
    userId: {
        display: 'flex',
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '16px',
    },
}))

export const SocialAccount = memo<SocialAccountProps>(function SocialAccount({ avatar, userId, site }) {
    const { classes } = useStyles()
    return (
        <Link
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://${site}/${userId}`}
            className={classes.iconBlack}>
            <Box
                padding="12px"
                display="flex"
                flexDirection="column"
                gap="10px"
                alignItems="center"
                className={classes.container}>
                <AccountAvatar avatar={avatar} network={site} isValid />
                <Box className={classes.userId}>{`@${userId}`}</Box>
            </Box>
        </Link>
    )
})
