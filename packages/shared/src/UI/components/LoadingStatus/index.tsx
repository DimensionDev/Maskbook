import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, Typography, type BoxProps } from '@mui/material'
import { memo } from 'react'
import { useSharedI18N } from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    text: {
        color: theme.palette.maskColor.second,
        fontSize: '14px',
        fontWeight: 400,
        marginTop: theme.spacing(1.5),
    },
}))

export const LoadingStatus = memo(function LoadingStatus({ className, children, ...rest }: BoxProps) {
    const { classes, cx } = useStyles()
    const t = useSharedI18N()
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <LoadingBase size={32} />
            <Typography className={classes.text}>{children ?? t.loading()}</Typography>
        </Box>
    )
})
