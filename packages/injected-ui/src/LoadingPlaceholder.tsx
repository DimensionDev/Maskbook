import { memo, type HTMLProps, type ReactNode } from 'react'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        gap: 12,
    },
    icon: {
        color: theme.vars.palette.maskColor.main,
    },
    text: {
        color: theme.vars.palette.maskColor.second,
        fontSize: '14px',
        fontWeight: 400,
        marginTop: 12,
    },
}))

interface LoadingPlaceholderProps extends Omit<HTMLProps<HTMLDivElement>, 'title'> {
    title?: ReactNode
}

/** A full-page loading spinner used across popups pages. Defaults its text to "Loading" when no title is given. */
export const LoadingPlaceholder = memo(function LoadingPlaceholder({ title, ...rest }: LoadingPlaceholderProps) {
    const { classes, cx } = useStyles()

    return (
        <main {...rest} className={cx(classes.container, rest.className)}>
            <LoadingBase size={24} className={classes.icon} />
            <Typography className={classes.text}>{title ?? 'Loading'}</Typography>
        </main>
    )
})
