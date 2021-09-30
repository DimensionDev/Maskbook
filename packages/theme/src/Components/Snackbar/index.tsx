import { forwardRef, useRef, memo, useCallback } from 'react'
import { keyframes } from 'tss-react'
import {
    SnackbarProvider,
    SnackbarProviderProps,
    SnackbarKey,
    useSnackbar,
    VariantType,
    SnackbarMessage,
    SnackbarContent,
    SnackbarAction,
    OptionsObject,
} from 'notistack'
import { Typography } from '@material-ui/core'
import { IconButton } from '@mui/material'
import classnames from 'classnames'
import { Close as CloseIcon } from '@mui/icons-material'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/Info'
import DoneIcon from '@material-ui/icons/Done'
import { LoadingIcon, RiskIcon } from '@masknet/icons'
import { makeStyles } from '../../makeStyles'
import { MaskColorVar } from '../../constants'

export { SnackbarProvider, useSnackbar } from 'notistack'
export type { VariantType, OptionsObject, SnackbarKey } from 'notistack'

const useStyles = makeStyles()((theme, _, createRef) => {
    const { palette } = theme
    const isDark = palette.mode === 'dark'
    const spinningAnimationKeyFrames = keyframes`
to {
  transform: rotate(360deg)
}`

    const title = {
        ref: createRef(),
        color: MaskColorVar.textPrimary,
        fontWeight: 400,
        fontSize: 14,
        lineHeight: '20px',
    } as const
    const message = {
        ref: createRef(),
        color: MaskColorVar.textSecondary,
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
    } as const
    const defaultVariant = {
        background: isDark ? '#17191D' : '#F7F9FA',
        color: isDark ? '#D9D9D9' : '#0F1419',
        [`& .${title.ref}`]: {
            color: isDark ? '#D9D9D9' : palette.grey['800'],
        },
    }
    const success = {
        backgroundColor: '#60DFAB',
        color: '#ffffff',
        [`& .${title.ref}`]: {
            color: 'inherit',
        },
        [`& .${message.ref}`]: {
            color: 'inherit',
        },
    } as const

    const error = {
        background: '#FF5F5F',
        color: '#ffffff',
        [`& .${title.ref}`]: {
            color: 'inherit',
        },
        [`& .${message.ref}`]: {
            color: 'inherit',
        },
    } as const

    const info = {
        background: '#8CA3C7',
        color: '#ffffff',
        [`& .${title.ref}`]: {
            color: 'inherit',
        },
        [`& .${message.ref}`]: {
            color: 'inherit',
        },
    }

    const warning = {
        ref: createRef(),
        backgroundColor: '#FFB915',
        color: '#ffffff',
        [`& .${title.ref}`]: {
            color: 'inherit',
        },
        [`& .${message.ref}`]: {
            color: 'inherit',
        },
    } as const

    return {
        root: {
            zIndex: 9999,
            color: MaskColorVar.textLight,
            pointerEvents: 'inherit',
        },
        content: {
            alignItems: 'center',
            padding: theme.spacing(1.5, 2),
            borderRadius: 12,
            width: 380,
            flexWrap: 'nowrap !important' as 'nowrap',
            [`&.${success.ref}`]: {
                background: MaskColorVar.greenMain,
                color: MaskColorVar.lightestBackground,
            },
            [`&.${error.ref}`]: {
                background: MaskColorVar.redMain,
                color: MaskColorVar.lightestBackground,
                title: {
                    color: 'inherit',
                },
            },
            [`&.${info.ref}`]: {
                color: MaskColorVar.lightestBackground,
            },
            [`&.${warning.ref}`]: {
                color: '#ffffff',
            },
        },
        default: defaultVariant,
        success,
        error,
        info,
        warning,
        icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        spinning: {
            display: 'flex',
            animation: `${spinningAnimationKeyFrames} 2s infinite linear`,
        },
        action: {
            marginLeft: 'auto',
        },
        closeButton: {
            color: 'inherit',
        },
        texts: {
            marginLeft: theme.spacing(2),
        },
        title,
        message,
        link: {
            display: 'flex',
            marginLeft: theme.spacing(0.5),
        },
    }
})

export interface CustomSnackbarContentProps {
    id: SnackbarKey
    title: SnackbarMessage
    message?: string | React.ReactNode
    icon?: React.ReactNode
    processing?: boolean
    variant?: VariantType
    link?: string
    action?: SnackbarAction
}
const IconMap: Record<VariantType, React.ReactNode> = {
    default: <InfoIcon color="inherit" />,
    success: <DoneIcon color="inherit" />,
    error: <RiskIcon />,
    warning: (
        <span style={{ color: MaskColorVar.warning }}>
            <WarningIcon />
        </span>
    ),
    info: <InfoIcon color="inherit" />,
}

export const CustomSnackbarContent = forwardRef<HTMLDivElement, CustomSnackbarContentProps>((props, ref) => {
    const { classes } = useStyles()
    const snackbar = useSnackbar()
    const loadingIcon = <LoadingIcon color="inherit" className={classes.spinning} />
    const variantIcon = props.processing ? loadingIcon : props.variant ? IconMap[props.variant] : null
    let renderedAction = (
        <IconButton className={classes.closeButton} onClick={() => snackbar.closeSnackbar(props.id)}>
            <CloseIcon />
        </IconButton>
    )
    if (props.action) {
        renderedAction = typeof props.action === 'function' ? props.action(props.id) : props.action
    }
    return (
        <SnackbarContent ref={ref} className={classnames(classes.content, classes[props.variant!])}>
            {variantIcon && <div className={classes.icon}>{variantIcon}</div>}
            <div className={classes.texts}>
                <Typography className={classes.title} variant="h2">
                    {props.title}
                </Typography>
                {props.message && (
                    <Typography className={classes.message} variant="body1">
                        {props.message}
                    </Typography>
                )}
            </div>
            <div className={classes.action}>{renderedAction}</div>
        </SnackbarContent>
    )
})

export const CustomSnackbarProvider = memo<SnackbarProviderProps>((props) => {
    const ref = useRef<SnackbarProvider>(null)
    const { classes } = useStyles()
    const onDismiss = (key: string | number) => () => {
        ref.current?.closeSnackbar(key)
    }

    return (
        <SnackbarProvider
            ref={ref}
            maxSnack={30}
            disableWindowBlurListener
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            hideIconVariant
            content={(key, title) => (
                <CustomSnackbarContent id={key} variant={props.variant ?? 'default'} title={title} />
            )}
            action={(key) => (
                <IconButton size="large" onClick={onDismiss(key)} sx={{ color: 'inherit' }}>
                    <CloseIcon color="inherit" />
                </IconButton>
            )}
            classes={{
                containerRoot: classes.root,
                variantSuccess: classes.success,
                variantError: classes.error,
                variantInfo: classes.info,
                variantWarning: classes.warning,
            }}
            {...props}
        />
    )
})

interface Options extends OptionsObject, Pick<CustomSnackbarContentProps, 'message' | 'processing' | 'icon'> {}

export function useCustomSnackbar() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const showSnackbar = useCallback(
        (
            text: SnackbarMessage,
            options: Options = {
                variant: 'default',
            },
        ) => {
            const { processing, message, variant, ...rest } = options
            return enqueueSnackbar(text, {
                variant: options.variant,
                content: (key, title) => {
                    return (
                        <CustomSnackbarContent
                            variant={variant ?? 'default'}
                            id={key}
                            title={title}
                            message={message}
                            processing={processing}
                            action={rest.action}
                        />
                    )
                },
                ...rest,
            })
        },
        [enqueueSnackbar],
    )

    return { showSnackbar, closeSnackbar }
}
