import { memo, useRef, forwardRef, useCallback } from 'react'
import { Typography, collapseClasses } from '@mui/material'
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

const useStyles = makeStyles()(() => ({
    container: {
        width: '100%!important',
        maxWidth: '100%!important',
        top: '0!important',
        [`& .${collapseClasses.wrapper}`]: {
            padding: '0 !important',
        },
    },
    content: {
        width: '100vw',
        padding: '8px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: '18px',
    },
    title: {
        lineHeight: '18px',
        padding: '0 8px',
    },
    success: {
        background: 'rgba(61, 194, 51, 0.5)',
        color: '#ffffff',
    },
    error: {
        background: 'rgba(255, 53, 69, 0.5)',
        color: '#ffffff',
    },
    // eslint-disable-next-line tss-unused-classes/unused-classes
    default: {},
    warning: {},
    info: {},
}))

export const PopupSnackbarProvider = memo<SnackbarProviderProps>(({ ...rest }) => {
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
            {...rest}
        />
    )
})

export interface PopupSnackbarContentProps {
    id: SnackbarKey
    title: SnackbarMessage
    message?: string | React.ReactNode
    variant?: VariantType
}

export const PopupSnackbarContent = forwardRef<HTMLDivElement, PopupSnackbarContentProps>((props, ref) => {
    const { classes, cx } = useStyles()

    return (
        <SnackbarContent key={props.id} className={cx(classes.content, classes[props.variant!])} ref={ref}>
            <Typography className={classes.title}>{props.title}</Typography>
        </SnackbarContent>
    )
})

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
                    return <PopupSnackbarContent id={key} title={title} variant={variant} />
                },
                autoHideDuration: 2000,
                ...rest,
            })
        },
        [enqueueSnackbar],
    )

    return { showSnackbar, closeSnackbar }
}
