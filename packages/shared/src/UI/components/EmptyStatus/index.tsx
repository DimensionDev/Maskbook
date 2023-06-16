import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, type BoxProps } from '@mui/material'
import { memo } from 'react'

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

export const EmptyStatus = memo(function EmptyStatus({ className, children, ...rest }: BoxProps) {
    const { classes, cx } = useStyles()
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <Icons.EmptySimple size={32} />
            <Typography className={classes.text} component="div">
                {children}
            </Typography>
        </Box>
    )
})
