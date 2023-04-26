import { memo } from 'react'
import { useI18N } from '../../../locales/i18n_generated.js'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, alpha } from '@mui/material'
import { useChainContext } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        height: 200,
        borderRadius: 12,
        backgroundImage: `url(${new URL('../../../assets/ARB-background.png', import.meta.url)})`,
        backgroundRepeat: 'no-repeat',
        paddingLeft: 232,
        paddingRight: 20,
    },
    content: {
        marginTop: 46,
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1.2,
        color: theme.palette.maskColor.white,
    },
    timeTips: {
        marginTop: theme.spacing(1),
        color: alpha(theme.palette.maskColor.white, 0.8),
    },
    noAccount: {
        marginTop: theme.spacing(1),
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.white,
    },
}))

export const AirDropActivityItem = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const { account } = useChainContext()

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Typography className={classes.title}>{t.airdrop_title({ symbol: 'ARB' })}</Typography>
                <Typography className={classes.timeTips}>
                    {t.airdrop_in_progress_time_tips({ date: '129 d  02 h  39 m' })}
                </Typography>
                {!account ? (
                    <Typography className={classes.noAccount}>{t.no_account_tips({ symbol: 'ARB' })}</Typography>
                ) : null}
            </Box>
        </Box>
    )
})
