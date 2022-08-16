import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles, MaskColorVar, LoadingBase } from '@masknet/theme'

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
}))

export const LoadingPlaceholder = memo(() => {
    const { classes } = useStyles()
    return (
        <Box className={classes.container}>
            <LoadingBase size={30} color={MaskColorVar.primary} />
            <Typography className={classes.prompt}>loading...</Typography>
        </Box>
    )
})
