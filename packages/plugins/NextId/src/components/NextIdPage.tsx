import { useI18N } from '../locales'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    tip: {
        background: theme.palette.background.default,
    },
}))

export function NextIdPage() {
    const t = useI18N()
    const { classes } = useStyles()

    return (
        <Box>
            <Box className={classes.tip}>{t.connect_wallet_tip()}</Box>
        </Box>
    )
}
