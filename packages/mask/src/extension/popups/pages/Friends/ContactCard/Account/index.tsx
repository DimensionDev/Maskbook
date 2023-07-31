import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { formatPersonaName } from '@masknet/shared-base'

interface AccountProps {
    icon: string
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

export const Account = memo<AccountProps>(({ userId, icon }) => {
    const { classes } = useStyles()
    return (
        <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
            <Icons.Lens width={30} height={30} />
            <Box className={classes.userId}>
                {formatPersonaName(userId)}
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://lenster.com/${userId}`}
                    className={classes.iconBlack}>
                    <Icons.LinkOut size={16} />
                </Link>
            </Box>
        </Box>
    )
})
