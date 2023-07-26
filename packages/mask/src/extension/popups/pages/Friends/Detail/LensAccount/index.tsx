import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { formatPersonaName } from '@masknet/shared-base'

interface LensAccountProps {
    userId: string
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
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '18px',
    },
}))

export const LensAccount = memo<LensAccountProps>(({ userId }) => {
    const { classes } = useStyles()
    return (
        <Box
            padding="12px"
            display="flex"
            flexDirection="column"
            gap="10px"
            alignItems="center"
            className={classes.container}>
            <Icons.Lens width={40} height={40} />
            <Box className={classes.userId}>
                {formatPersonaName(userId)}
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
