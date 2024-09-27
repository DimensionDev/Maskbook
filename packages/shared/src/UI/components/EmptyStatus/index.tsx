import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
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
    text: {
        color: theme.palette.maskColor.second,
        fontSize: '14px',
        fontWeight: 400,
        marginTop: theme.spacing(1.5),
    },
}))

interface Props extends BoxProps {
    iconSize?: number
}

export const EmptyStatus = memo(function EmptyStatus({ className, children, iconSize = 32, ...rest }: Props) {
    const { classes, cx } = useStyles()
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <Icons.EmptySimple size={iconSize} />
            <Typography className={classes.text} component="div">
                {children ?? <Trans>No Data</Trans>}
            </Typography>
        </Box>
    )
})
