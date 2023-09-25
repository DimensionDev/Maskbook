import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo, type PropsWithChildren } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'fixed',
        bottom: 0,
        background: theme.palette.maskColor.secondaryBottom,
        padding: theme.spacing(2),
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
        left: 0,
        right: 0,
        display: 'flex',
        columnGap: theme.spacing(2),
    },
}))

export const BottomController = memo<PropsWithChildren>(function BottomController({ children }) {
    const { classes } = useStyles()
    return <Box className={classes.container}>{children}</Box>
})
