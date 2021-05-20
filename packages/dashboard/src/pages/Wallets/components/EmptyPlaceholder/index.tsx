import { memo } from 'react'
import { Box, makeStyles, Typography } from '@material-ui/core'
import { EmptyIcon } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

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
        width: 96,
        height: 96,
        fill: 'none',
    },
}))

export interface EmptyPlaceholderProps {
    prompt: string
}

export const EmptyPlaceholder = memo<EmptyPlaceholderProps>(({ prompt }) => {
    const classes = useStyles()
    return (
        <Box className={classes.container}>
            <EmptyIcon className={classes.icon} />
            <Typography className={classes.prompt}>{prompt}</Typography>
        </Box>
    )
})
