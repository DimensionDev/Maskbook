import { memo } from 'react'
import { Box, makeStyles, Typography } from '@material-ui/core'
import { SynchronizeIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    prompt: {
        color: MaskColorVar.textLight,
        fontSize: theme.typography.pxToRem(12),
        lineHeight: theme.typography.pxToRem(16),
        marginTop: theme.spacing(2.5),
    },
    icon: {
        width: 60,
        height: 60,
        fill: 'none',
    },
}))

export const LoadingPlaceholder = memo(() => {
    const classes = useStyles()
    return (
        <Box className={classes.container}>
            <SynchronizeIcon className={classes.icon} />
            <Typography className={classes.prompt}>loading...</Typography>
        </Box>
    )
})
