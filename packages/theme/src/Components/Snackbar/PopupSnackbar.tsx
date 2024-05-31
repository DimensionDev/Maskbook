import { memo, useRef, useCallback, type RefAttributes } from 'react'
import { Typography, alpha, collapseClasses } from '@mui/material'
import {
    SnackbarProvider,
    type SnackbarProviderProps,
    type SnackbarMessage,
    SnackbarContent,
    type VariantType,
    type SnackbarKey,
    useSnackbar,
} from 'notistack'
import { makeStyles } from '../../UIHelper/index.js'
import type { ShowSnackbarOptions } from './index.js'

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
        background: alpha(theme.palette.maskColor.success, 0.5),
        color: theme.palette.maskColor.white,
    },
    error: {
        background: alpha(theme.palette.maskColor.danger, 0.5),
        color: theme.palette.maskColor.white,
    },
    warning: {
        background: alpha(theme.palette.maskColor.warn, 0.5),
        color: theme.palette.maskColor.white,
    },
    // eslint-disable-next-line tss-unused-classes/unused-classes
    default: {},

    info: {},
}))

export const PopupSnackbarProvider = memo<SnackbarProviderProps>(function PopupSnackbarProvider(props) {
    const ref = useRef<SnackbarProvider>(null)
    const { classes } = useStyles()

    return (
        <SnackbarProvider
            ref={ref}
            maxSnack={1}
            disableWindowBlurListener
            autoHideDuration={2000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            classes={{
                containerRoot: classes.container,
                variantSuccess: classes.success,
                variantError: classes.error,
                variantInfo: classes.info,
                variantWarning: classes.warning,
            }}
            {...props}
        />
    )
})

interface PopupSnackbarContentProps extends RefAttributes<HTMLDivElement> {
    id: SnackbarKey
    title: SnackbarMessage
    message?: string | React.ReactNode
    variant?: VariantType
}

function PopupSnackbarContent({ id, title, message, variant, ref }: PopupSnackbarContentProps) {
    const { classes, cx } = useStyles()

    return (
        <SnackbarContent ref={ref} key={id} className={cx(classes.content, classes[variant!])}>
            <Typography className={classes.title} component="div">
                {title}
            </Typography>
            {typeof message === 'string' ?
                <Typography className={classes.message}>{message}</Typography>
            :   message}
        </SnackbarContent>
    )
}

export function usePopupCustomSnackbar() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const showSnackbar = useCallback(
        (
            text: SnackbarMessage,
            options: ShowSnackbarOptions = {
                variant: 'success',
                autoHideDuration: 2000,
            },
        ) => {
            const { processing, message, variant, ...rest } = options
            return enqueueSnackbar(text, {
                variant: options.variant,
                content: (key, title) => {
                    return <PopupSnackbarContent id={key} title={title} message={message} variant={variant} />
                },
                autoHideDuration: 2000,
                ...rest,
            })
        },
        [enqueueSnackbar],
    )

    return { showSnackbar, closeSnackbar }
}
