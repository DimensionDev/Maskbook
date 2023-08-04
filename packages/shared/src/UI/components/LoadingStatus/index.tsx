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

interface Props extends BoxProps {
    omitText?: boolean
    iconSize?: number
}

export const LoadingStatus = memo(function LoadingStatus({
    omitText,
    className,
    iconSize = 32,
    children,
    ...rest
}: Props) {
    const { classes, cx } = useStyles()
    const t = useSharedI18N()
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <LoadingBase size={iconSize} />
            {omitText ? null : <Typography className={classes.text}>{children ?? t.loading()}</Typography>}
        </Box>
    )
})
