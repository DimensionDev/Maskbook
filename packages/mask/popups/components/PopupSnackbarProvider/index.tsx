import type { RefAttributes } from 'react'
import { Typography, collapseClasses } from '@mui/material'
import { SnackbarProvider, SnackbarContent, type CustomContentProps } from 'notistack'
import { alpha, makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%!important',
        maxWidth: '100%!important',
        top: '0!important',
        backdropFilter: 'blur(5px)',
        [`& .${collapseClasses.wrapper}`]: {
            padding: '0 !important',
        },
    },
    content: {
        width: '100vw',
        padding: '8px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: '18px',
    },
    title: {
        lineHeight: '18px',
        padding: '0 8px',
    },
    message: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    success: {
        background: alpha(theme.vars.palette.maskColor.success, 0.5),
        color: theme.vars.palette.maskColor.white,
    },
    error: {
        background: alpha(theme.vars.palette.maskColor.danger, 0.5),
        color: theme.vars.palette.maskColor.white,
    },
    warning: {
        background: alpha(theme.vars.palette.maskColor.warn, 0.5),
        color: theme.vars.palette.maskColor.white,
    },
    default: {},
    info: {},
}))

export function PopupSnackbarProvider() {
    const { classes } = useStyles()

    return (
        <SnackbarProvider
            maxSnack={1}
            disableWindowBlurListener
            autoHideDuration={2000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            Components={{
                default: PopupSnackbarContent,
                success: PopupSnackbarContent,
                error: PopupSnackbarContent,
                warning: PopupSnackbarContent,
                info: PopupSnackbarContent,
            }}
            classes={{
                containerRoot: classes.container,
            }}
        />
    )
}

function PopupSnackbarContent({
    id,
    message,
    detail,
    variant,
    ref,
}: CustomContentProps & RefAttributes<HTMLDivElement>) {
    const { classes, cx } = useStyles()
    const variantClass = {
        default: classes.default,
        success: classes.success,
        error: classes.error,
        warning: classes.warning,
        info: classes.info,
    }[variant]

    return (
        <SnackbarContent ref={ref} key={id} className={cx(classes.content, variantClass)}>
            <Typography className={classes.title} component="div">
                {message}
            </Typography>
            {typeof detail === 'string' ?
                <Typography className={classes.message}>{detail}</Typography>
            :   detail}
        </SnackbarContent>
    )
}
