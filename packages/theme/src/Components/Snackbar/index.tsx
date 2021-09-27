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
} from 'notistack'
import { Link, Typography } from '@material-ui/core'
import { IconButton } from '@mui/material'
import classnames from 'classnames'
import LaunchIcon from '@material-ui/icons/Launch'
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
    const spinningAnimationKeyFrames = keyframes`
to {
  transform: rotate(360deg)
}`

    const title = {
        ref: createRef(),
        color: MaskColorVar.textPrimary,
        fontSize: 14,
        lineHeight: '20px',
    } as const
    const message = {
        ref: createRef(),
        color: MaskColorVar.textSecondary,
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
    } as const
    const defaultVariant = {
        background: palette.background.default,
        color: palette.grey['800'],
        [`& .${title.ref}`]: {
            color: '#0F1419',
        },
    }
    const success = {
        backgroundColor: '#77E0B5',
        color: '#ffffff',
        [`& .${title.ref}`]: {
            color: 'inherit',
        },
        [`& .${message.ref}`]: {
            color: 'inherit',
        },
    } as const

    const error = {
        background: MaskColorVar.redMain,
        color: '#ffffff',
        [`& .${title.ref}`]: {
            color: 'inherit',
        },
        [`& .${message.ref}`]: {
            color: 'inherit',
        },
    } as const

    const info = {
        ref: createRef(),
        background: MaskColorVar.secondaryInfoText,
        color: MaskColorVar.lightestBackground,
    } as const

    const warning = {
        ref: createRef(),
        color: MaskColorVar.warning,
        [`& .${title.ref}`]: {
            color: '#0F1419',
        },
        [`& .${message.ref}`]: {
            color: MaskColorVar.warning,
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
            backgroundColor: palette.background.default,
            color: '#0F1419',
            padding: theme.spacing(1.5, 2),
            borderRadius: 12,
            width: 380,
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
                color: '#FF5F5F',
            },
        },
        default: defaultVariant,
        success,
        error,
        info,
        warning,
        icon: {},
        spinning: {
            display: 'flex',
            animation: `${spinningAnimationKeyFrames} 2s infinite linear`,
        },
        action: {
            marginLeft: 'auto',
            width: 50,
            height: 50,
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
    message?: string
    icon?: React.ReactNode
    processing?: boolean
    variant?: VariantType
    link?: string
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
                        {!!props.link && (
                            <Link
                                color="inherit"
                                className={classes.link}
                                href={props.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stop}>
                                <LaunchIcon color="inherit" fontSize="inherit" />
                            </Link>
                        )}
                    </Typography>
                )}
            </div>
            <IconButton className={classes.action} onClick={() => snackbar.closeSnackbar(props.id)}>
                <CloseIcon />
            </IconButton>
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

export function useShowCostomSnackbar() {
    const snackbar = useSnackbar()
    const showSnackbar = useCallback(
        (
            message: string,
            options: Partial<CustomSnackbarContentProps & { persist: boolean }> = {
                variant: 'default',
            },
        ) => {
            return snackbar.enqueueSnackbar(message, {
                variant: options.variant,
                content: (key, title) => {
                    return <CustomSnackbarContent id={key} title={title} {...options} />
                },
            })
        },
        [snackbar],
    )

    return showSnackbar
}
