import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, Typography, type BoxProps } from '@mui/material'
import { memo } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    icon: {
        color: theme.palette.maskColor.main,
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
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <LoadingBase size={iconSize} className={classes.icon} />
            {omitText ? null : <Typography className={classes.text}>{children ?? <Trans>Loading</Trans>}</Typography>}
        </Box>
    )
})
