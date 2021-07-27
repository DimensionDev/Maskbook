import { forwardRef, useRef, memo } from 'react'
import {
    SnackbarProvider,
    SnackbarProviderProps,
    SnackbarKey,
    useSnackbar,
    VariantType,
    SnackbarMessage,
    SnackbarContent,
} from 'notistack'
import { makeStyles, IconButton, Link, Typography } from '@material-ui/core'
import classnames from 'classnames'
import LaunchIcon from '@material-ui/icons/Launch'
import CloseIcon from '@material-ui/icons/Close'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/Info'
import DoneIcon from '@material-ui/icons/Done'
import { LoadingIcon, RiskIcon } from '@masknet/icons'
import { MaskColorVar } from '../../constants'

export { SnackbarProvider, useSnackbar } from 'notistack'
export type { VariantType, SnackbarKey } from 'notistack'

const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: 99999,
        color: MaskColorVar.textLight,
        pointerEvents: 'inherit',
    },
    success: {
        background: MaskColorVar.greenMain,
        color: MaskColorVar.lightestBackground,
        '& $title': {
            color: 'inherit',
        },
        '& $message': {
            color: 'inherit',
        },
    },
    error: {
        background: MaskColorVar.redMain,
        color: MaskColorVar.lightestBackground,
        '& $title': {
            color: 'inherit',
        },
        '& $message': {
            color: 'inherit',
        },
    },
    default: {
        background: MaskColorVar.secondaryInfoText,
        color: MaskColorVar.lightestBackground,
    },
    info: {
        background: MaskColorVar.secondaryInfoText,
        color: MaskColorVar.lightestBackground,
    },
    warning: {
        color: MaskColorVar.lightestBackground,
    },
    icon: {},
    spinning: {
        display: 'flex',
        animation: '$spinning 2s infinite linear',
    },
    '@keyframes spinning': {
        to: {
            transform: 'rotate(360deg)',
        },
    },
    action: {
        marginLeft: 'auto',
        width: 50,
        height: 50,
        color: 'inherit',
    },
    content: {
        alignItems: 'center',
        backgroundColor: MaskColorVar.primaryBackground,
        padding: theme.spacing(1.5, 2),
        borderRadius: 12,
        width: 380,
        '&$success': {
            background: MaskColorVar.greenMain,
            color: MaskColorVar.lightestBackground,
        },
        '&$error': {
            background: MaskColorVar.redMain,
            color: MaskColorVar.lightestBackground,
            title: {
                color: 'inherit',
            },
        },
        '&$info': {
            background: MaskColorVar.secondaryInfoText,
            color: MaskColorVar.lightestBackground,
        },
        '&$warning': {
            color: MaskColorVar.textPrimary,
        },
    },
    texts: {
        marginLeft: theme.spacing(2),
    },
    title: {
        color: MaskColorVar.textPrimary,
        fontSize: 14,
    },
    message: {
        color: MaskColorVar.textSecondary,
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
    },
    link: {
        display: 'flex',
        marginLeft: theme.spacing(0.5),
    },
}))

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
    const classes = useStyles()
    const snackbar = useSnackbar()
    const loadingIcon = <LoadingIcon color="inherit" className={classes.spinning} />
    let variantIcon = props.processing ? loadingIcon : props.variant ? IconMap[props.variant] : null
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
                        <Link
                            color="inherit"
                            className={classes.link}
                            href={props.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <LaunchIcon color="inherit" fontSize="inherit" />
                        </Link>
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
    const classes = useStyles()

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
            content={(key, title) => <CustomSnackbarContent id={key} variant={props.variant} title={title} />}
            action={(key) => (
                <IconButton onClick={onDismiss(key)} sx={{ color: 'inherit' }}>
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
