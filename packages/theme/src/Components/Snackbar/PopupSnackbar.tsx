import { memo, useRef, forwardRef, useCallback } from 'react'
import { Typography, collapseClasses } from '@mui/material'
import {
    SnackbarProvider,
    SnackbarProviderProps,
    SnackbarMessage,
    SnackbarContent,
    VariantType,
    SnackbarKey,
    useSnackbar,
} from 'notistack'
import { makeStyles } from '../../UIHelper'
import classnames from 'classnames'
import type { ShowSnackbarOptions } from './index'

const useStyles = makeStyles()(() => ({
    container: {
        width: '100%!important',
        maxWidth: '100%!important',
        top: '0px!important',
        [`& .${collapseClasses.wrapper}`]: {
            padding: '0px !important',
        },
    },
    content: {
        width: '100vw',
        padding: '8px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        lineHeight: '18px',
    },
    title: {
        fontSize: 14,
        lineHeight: '18px',
    },
    success: {
        background: 'rgba(61, 194, 51, 0.5)',
        color: '#ffffff',
    },
    error: {
        background: 'rgba(255, 53, 69, 0.5)',
        color: '#ffffff',
    },
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
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            classes={{
                containerRoot: classes.container,
                variantSuccess: classes.success,
                variantError: classes.error,
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
    const { classes } = useStyles()

    return (
        <SnackbarContent key={props.id} className={classnames(classes.content, classes[props.variant!])} ref={ref}>
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
                ...rest,
            })
        },
        [enqueueSnackbar],
    )

    return { showSnackbar, closeSnackbar }
}
