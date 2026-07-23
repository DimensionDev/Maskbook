import type { RefAttributes } from 'react'
import { keyframes } from 'tss-react'
import {
    SnackbarProvider,
    type SnackbarProviderProps,
    type VariantType,
    SnackbarContent,
    type OptionsObject,
    useSnackbar,
    type CustomContentProps,
} from 'notistack'
import { Typography, IconButton } from '@mui/material'
import { Close as CloseIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material'
import { Icons } from '@masknet/icons'
import { alpha } from '../../Theme/colors.js'
import { makeStyles } from '../../UIHelper/index.js'
import { usePortalShadowRoot } from '../../ShadowRoot/index.js'

export { useSnackbar } from 'notistack'
export type { SnackbarKey, SnackbarMessage } from 'notistack'

declare module 'notistack' {
    interface OptionsObject<V extends VariantType = VariantType> extends SharedProps<V> {
        detail?: React.ReactNode
        processing?: boolean
        classes?: Partial<Record<'content' | 'title' | 'message', string>>
    }
}

// #region SnackbarContent
const useStyles = makeStyles<void, 'title' | 'message'>()((theme, _, classNames) => {
    const spinningAnimationKeyFrames = keyframes`
        to {
          transform: rotate(360deg)
        }
    `

    return {
        content: {
            alignItems: 'center',
            padding: theme.spacing(2),
            borderRadius: 12,
            width: 380,
            flexWrap: 'nowrap !important' as 'nowrap',
        },
        default: {
            background: theme.vars.palette.maskColor.bottom,
            color: theme.vars.palette.maskColor.main,
            boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.1)',
            ...theme.applyStyles('dark', { boxShadow: '0px 4px 30px rgba(255, 255, 255, 0.15)' }),
            [`& .${classNames.title}`]: {
                color: 'inherit',
            },

            [`& .${classNames.message}`]: {
                color: 'inherit',
            },
        },
        success: {
            backgroundColor: theme.vars.palette.maskColor.success,
            color: theme.vars.palette.maskColor.white,
            boxShadow: `0px 6px 20px ${alpha(theme.vars.palette.maskColor.success, 0.15)}`,
            backdropFilter: 'blur(16px)',
            [`& .${classNames.title}`]: {
                color: 'inherit',
            },
            [`& .${classNames.message}`]: {
                color: alpha(theme.vars.palette.maskColor.white, 0.8),
                '& svg': {
                    color: theme.vars.palette.maskColor.white,
                },
            },
        },
        error: {
            background: theme.vars.palette.maskColor.danger,
            color: theme.vars.palette.maskColor.white,
            boxShadow: `0px 6px 20px ${alpha(theme.vars.palette.maskColor.danger, 0.15)}`,
            backdropFilter: 'blur(16px)',
            [`& .${classNames.title}`]: {
                color: 'inherit',
            },
            [`& .${classNames.message}`]: {
                color: alpha(theme.vars.palette.maskColor.white, 0.8),
                '& svg': {
                    color: theme.vars.palette.maskColor.white,
                },
            },
        },
        info: {
            background: theme.vars.palette.maskColor.primary,
            color: theme.vars.palette.maskColor.white,
            boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.1)',
            ...theme.applyStyles('dark', { boxShadow: '0px 4px 30px rgba(255, 255, 255, 0.15)' }),
            [`& .${classNames.title}`]: {
                color: 'inherit',
            },
            [`& .${classNames.message}`]: {
                color: alpha(theme.vars.palette.maskColor.white, 0.8),
                '& svg': {
                    color: theme.vars.palette.maskColor.white,
                },
            },
        },
        warning: {
            backgroundColor: theme.vars.palette.maskColor.warn,
            color: theme.vars.palette.maskColor.white,
            boxShadow: `0px 6px 20px ${alpha(theme.vars.palette.maskColor.warn, 0.15)}`,
            backdropFilter: 'blur(16px)',
            [`& .${classNames.title}`]: {
                color: 'inherit',
            },
            [`& .${classNames.message}`]: {
                color: alpha(theme.vars.palette.maskColor.white, 0.8),
                '& svg': {
                    color: theme.vars.palette.maskColor.white,
                },
            },
        },
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
            '& :focus:not(:focus-visible)': {
                outline: 0,
            },
        },
        title: {
            color: theme.vars.palette.maskColor.main,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '18px',
        },
        message: {
            color: theme.vars.palette.maskColor.main,
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            fontSize: 14,
            lineHeight: '18px',
            wordBreak: 'break-word',
            '& > a': {
                display: 'flex',
                alignItems: 'center',
            },
            '& :focus:not(:focus-visible)': {
                outline: 0,
            },
        },
    }
})

const IconMap: Record<VariantType, React.ReactNode> = {
    default: <InfoIcon color="inherit" />,
    success: <Icons.SuccessForSnackBar />,
    error: <Icons.TransactionFailed />,
    warning: <WarningIcon color="inherit" />,
    info: <InfoIcon color="inherit" />,
}

function MaskSnackbarContent(props: CustomContentProps & RefAttributes<HTMLDivElement>) {
    const { classes, cx } = useStyles()
    const variantClass = {
        default: classes.default,
        success: classes.success,
        error: classes.error,
        warning: classes.warning,
        info: classes.info,
    }[props.variant!]
    const snackbar = useSnackbar()
    const loadingIcon = <Icons.CircleLoading className={classes.spinning} />
    const variantIcon =
        props.processing ? loadingIcon
        : props.variant ? IconMap[props.variant]
        : null
    let renderedAction: React.ReactNode = (
        <IconButton className={classes.closeButton} onClick={() => snackbar.closeSnackbar(props.id)}>
            <CloseIcon />
        </IconButton>
    )
    if (props.action) {
        renderedAction = typeof props.action === 'function' ? props.action(props.id) : props.action
    }
    return (
        <SnackbarContent ref={props.ref} className={cx(classes.content, variantClass, props.classes?.content)}>
            {variantIcon ?
                <div className={classes.icon}>{variantIcon}</div>
            :   null}
            <div className={classes.texts}>
                <Typography className={cx(classes.title, props.classes?.title)} variant="h2">
                    {props.message}
                </Typography>
                {props.detail ?
                    <Typography className={cx(classes.message, props.classes?.message)} variant="body1">
                        {props.detail}
                    </Typography>
                :   null}
            </div>
            <div className={classes.action}>{renderedAction}</div>
        </SnackbarContent>
    )
}
// #endregion

// #region Provider
const useProviderStyles = makeStyles<{ offsetY?: number }>()((theme, { offsetY }) => ({
    root: {
        zIndex: 9999,
        transform: offsetY === undefined ? 'none' : `translateY(${offsetY}px)`,
        color: theme.vars.palette.maskColor.textLight,
        pointerEvents: 'inherit',
    },
}))

export interface MaskSnackbarProviderProps extends SnackbarProviderProps {
    offsetY?: number
}

export function MaskSnackbarProvider({ offsetY, ...rest }: MaskSnackbarProviderProps) {
    const { classes } = useProviderStyles({ offsetY })
    return usePortalShadowRoot((container) => (
        <SnackbarProvider
            maxSnack={30}
            disableWindowBlurListener
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            hideIconVariant
            Components={{
                default: MaskSnackbarContent,
                success: MaskSnackbarContent,
                error: MaskSnackbarContent,
                warning: MaskSnackbarContent,
                info: MaskSnackbarContent,
            }}
            action={(id) => <SnackbarAction id={id} />}
            classes={{
                containerRoot: classes.root,
            }}
            domRoot={container}
            {...rest}
        />
    ))
}
// #endregion

function SnackbarAction({ id }: { id: string | number }) {
    const snackbar = useSnackbar()
    return (
        <IconButton size="large" onClick={() => snackbar.closeSnackbar(id)} sx={{ color: 'inherit' }}>
            <CloseIcon color="inherit" />
        </IconButton>
    )
}

export type ShowMaskSnackbarOptions = OptionsObject
