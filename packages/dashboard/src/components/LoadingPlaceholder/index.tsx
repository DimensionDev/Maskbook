import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { LoadingAnimation } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
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
        width: 30,
        height: 30,
        fill: MaskColorVar.primary,
    },
}))

export const LoadingPlaceholder = memo(() => {
    const { classes } = useStyles()
    return (
        <Box className={classes.container}>
            <LoadingAnimation className={classes.icon} />
            <Typography className={classes.prompt}>loading...</Typography>
        </Box>
    )
})
