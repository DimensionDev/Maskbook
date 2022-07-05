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
import { Typography, IconButton } from '@mui/material'
import classnames from 'classnames'
import { Close as CloseIcon } from '@mui/icons-material'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import { CircleLoadingIcon, RiskIcon, SuccessForSnackBarIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '../../UIHelper'
import { MaskColorVar } from '../../CSSVariables'

export { PopupSnackbarProvider, usePopupCustomSnackbar } from './PopupSnackbar'
export { SnackbarProvider, useSnackbar } from 'notistack'
export type { VariantType, OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack'

interface StyleProps {
    offsetY?: number
}

const useStyles = makeStyles<StyleProps, 'title' | 'message'>()((theme, { offsetY }, refs) => {
    const { palette } = theme
    const isDark = palette.mode === 'dark'
    const spinningAnimationKeyFrames = keyframes`
to {
  transform: rotate(360deg)
}`
    const title = {
        color: MaskColorVar.textPrimary,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '20px',
    } as const
    const message = {
        color: MaskColorVar.textPrimary,
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        '& > a': {
            display: 'flex',
            alignItems: 'center',
        },
    } as const
    const defaultVariant = {
        background: isDark ? '#17191D' : '#F7F9FA',
        color: isDark ? '#D9D9D9' : '#0F1419',
        [`& .${refs.title}`]: {
            color: isDark ? '#D9D9D9' : MaskColorVar.textPrimary,
        },
    }
    const success = {
        backgroundColor: MaskColorVar.greenMain,
        color: '#ffffff',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: MaskColorVar.normalTextLight,
            '& svg': {
                color: MaskColorVar.white,
            },
        },
    } as const

    const error = {
        background: '#FF5F5F',
        color: '#ffffff',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: 'inherit',
        },
    } as const

    const info = {
        background: '#8CA3C7',
        color: '#ffffff',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: 'inherit',
        },
    }

    const warning = {
        backgroundColor: '#FFB915',
        color: '#ffffff',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: 'inherit',
        },
    } as const

    return {
        root: {
            zIndex: 9999,
            transform: typeof offsetY !== 'undefined' ? `translateY(${offsetY}px)` : 'none',
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
            '& > svg': {
                width: 24,
                height: 24,
            },
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
            transform: 'translateY(-10px)',
        },
        texts: {
            marginLeft: theme.spacing(1.5),
        },
        title,
        message,
    }
})

export interface CustomSnackbarContentProps {
    id: SnackbarKey
    title: SnackbarMessage
    message?: string | React.ReactNode
    icon?: React.ReactNode
    processing?: boolean
    variant?: VariantType
    action?: SnackbarAction
    offsetY?: number
    classes?: Partial<ReturnType<typeof useStyles>['classes']>
}
const IconMap: Record<VariantType, React.ReactNode> = {
    default: <InfoIcon color="inherit" />,
    success: <SuccessForSnackBarIcon />,
    error: <RiskIcon />,
    warning: <WarningIcon color="inherit" />,
    info: <InfoIcon color="inherit" />,
}

export const CustomSnackbarContent = forwardRef<HTMLDivElement, CustomSnackbarContentProps>((props, ref) => {
    const classes = useStylesExtends(useStyles({ offsetY: props.offsetY }), props)
    const snackbar = useSnackbar()
    const loadingIcon = <CircleLoadingIcon color="inherit" className={classes.spinning} />
    const variantIcon = props.processing ? loadingIcon : props.variant ? IconMap[props.variant] : null
    let renderedAction: React.ReactNode = (
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

export const CustomSnackbarProvider = memo<SnackbarProviderProps & { offsetY?: number }>(({ offsetY, ...rest }) => {
    const ref = useRef<SnackbarProvider>(null)
    const { classes } = useStyles({ offsetY })
    const onDismiss = (key: string | number) => () => {
        ref.current?.closeSnackbar(key)
    }

    return (
        <SnackbarProvider
            ref={ref}
            maxSnack={30}
            disableWindowBlurListener
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            hideIconVariant
            content={(key, title) => (
                <CustomSnackbarContent id={key} variant={rest.variant ?? 'default'} title={title} offsetY={offsetY} />
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
            {...rest}
        />
    )
})

export interface ShowSnackbarOptions
    extends OptionsObject,
        Pick<CustomSnackbarContentProps, 'message' | 'processing' | 'icon' | 'classes'> {}

export function useCustomSnackbar() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const showSnackbar = useCallback(
        (
            text: SnackbarMessage,
            options: ShowSnackbarOptions = {
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
                            classes={rest.classes}
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
