import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { AccountAvatar } from '../../Personas/components/AccountAvatar/index.js'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'

interface TwitterAccountProps {
    avatar: string
    userId: string
}

const useStyles = makeStyles()((theme) => ({
    iconBlack: {
        color: theme.palette.maskColor.main,
        display: 'flex',
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

export const TwitterAccount = memo<TwitterAccountProps>(({ avatar, userId }) => {
    const { classes } = useStyles()
    return (
        <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
            <AccountAvatar avatar={avatar} network="twitter.com" isValid />
            <Box className={classes.userId}>
                {`@${userId}`}
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://twitter.com/${userId}`}
                    className={classes.iconBlack}>
                    <Icons.LinkOut size={16} />
                </Link>
            </Box>
        </Box>
    )
})
