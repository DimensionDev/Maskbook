import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { AccountAvatar } from '../../../Personas/components/AccountAvatar/index.js'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { type EnhanceableSite, formatPersonaName } from '@masknet/shared-base'

interface SocialAccountProps {
    avatar: string
    userId: string
    site: EnhanceableSite
}

const useStyles = makeStyles()((theme) => ({
    iconBlack: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
    avatar: {
        width: 30,
        height: 30,
        alignItems: 'center',
    },
    userId: {
        display: 'flex',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '18px',
    },
}))

export const SocialAccount = memo<SocialAccountProps>(function SocialAccount({ avatar, userId, site }) {
    const { classes } = useStyles()
    return (
        <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
            <AccountAvatar
                avatar={avatar}
                network={site}
                isValid
                classes={{ avatar: classes.avatar, container: classes.avatar }}
            />
            <Box className={classes.userId}>
                {`@${formatPersonaName(userId)}`}
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://${site}/${userId}`}
                    className={classes.iconBlack}>
                    <Icons.LinkOut size={16} />
                </Link>
            </Box>
        </Box>
    )
})
