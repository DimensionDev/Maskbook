import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo, type PropsWithChildren } from 'react'

const useStyles = makeStyles()((theme) => ({
    card: {
        borderRadius: 12,
        padding: theme.spacing(2, 2, 2, 16),
        display: 'flex',
        alignItems: 'center',
        background: `url(${new URL('../../assets/banner.png', import.meta.url).toString()})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        height: 90,
        boxSizing: 'border-box',
    },
    tips: {
        '& > p': {
            color: theme.palette.maskColor.publicMain,
            fontSize: 16,
            fontWeight: 700,
            lineHeight: '120%',
            width: '100%',
            wordBreak: 'break-word',
        },
    },
}))

interface SmartPayBannerProps extends PropsWithChildren {}

export const SmartPayBanner = memo<SmartPayBannerProps>(({ children }) => {
    const { classes } = useStyles()
    return (
        <Box className={classes.card}>
            <Typography className={classes.tips}>{children}</Typography>
        </Box>
    )
})
