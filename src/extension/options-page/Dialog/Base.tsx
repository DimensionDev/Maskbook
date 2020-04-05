import React, { useMemo, useCallback, useReducer } from 'react'
import {
    DialogProps,
    useMediaQuery,
    Dialog,
    Fade,
    IconButton,
    createStyles,
    makeStyles,
    DialogContent,
    Typography,
} from '@material-ui/core'
import { Theme, ThemeProvider } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import type { TransitionProps } from '@material-ui/core/transitions'
import { useBlurContext } from '../DashboardBlurContext'
import { useSnackbar } from 'notistack'
import { useI18N } from '../../../utils/i18n-next-ui'
import { merge, cloneDeep } from 'lodash-es'

const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
    return <Fade ref={ref} {...props} />
})

const useStyles = makeStyles((theme) =>
    createStyles({
        close: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
        },
    }),
)

export interface DashboardDialogCoreProps extends DialogProps {
    closeIconColor?: string
}

export function DashboardDialogCore(props: DashboardDialogCoreProps) {
    const { fullScreen, children, closeIconColor, ...dialogProps } = props

    const mobile = useMediaQuery('(max-width: 600px)')
    const classes = useStyles()
    useBlurContext(dialogProps.open)

    return (
        <Dialog
            closeAfterTransition
            fullScreen={fullScreen ?? mobile}
            TransitionComponent={Transition}
            hideBackdrop
            {...dialogProps}>
            {children}
            <IconButton
                onClick={(e) => dialogProps.onClose?.(e, 'backdropClick')}
                className={classes.close}
                size="small"
                style={{ color: closeIconColor }}>
                <CloseIcon />
            </IconButton>
        </Dialog>
    )
}

export interface WrappedDialogProps<T extends object = any> extends DialogProps {
    ComponentProps?: T
    onClose(): void
}
type ShowModal = () => void
enum DialogState {
    Opened = 1,
    Closing,
    Destroyed,
}

type useModalState<Props extends object> = { state: DialogState; props?: Props }
type useModalActions<Props extends object> = { type: 'open' | 'close' | 'destroy'; props?: Props }
function reducer<Props extends object>(
    state: useModalState<Props>,
    action: useModalActions<Props>,
): useModalState<Props> {
    if (action.type === 'open') return { state: DialogState.Opened, props: action.props }
    if (action.type === 'close') return { state: DialogState.Closing, props: state.props }
    return { state: DialogState.Destroyed }
}

export function useModal<DialogProps extends object, AdditionalPropsAppendByDispatch extends Partial<DialogProps>>(
    component: React.FunctionComponent<WrappedDialogProps<DialogProps>>,
    ComponentProps?: DialogProps,
): [React.ReactNode, () => void, (props: AdditionalPropsAppendByDispatch) => void] {
    const Modal = useMemo(() => component, [component])
    const [status, dispatch] = useReducer(reducer, { state: DialogState.Destroyed })
    const showModal = useCallback(() => dispatch({ type: 'open' }), [])
    const showStatefulModal = useCallback(
        (props?: AdditionalPropsAppendByDispatch) => dispatch({ type: 'open', props }),
        [],
    )
    // TODO: prevent onClose on some cases (e.g, click away while loading)
    const onClose = useCallback(() => dispatch({ type: 'close' }), [])
    const onExited = useCallback(() => dispatch({ type: 'destroy' }), [])
    const { state, props } = status

    const compositeProps =
        ComponentProps || props ? { ComponentProps: { ...ComponentProps, ...props } as DialogProps } : {}
    const renderedComponent =
        state === DialogState.Destroyed ? null : (
            <Modal
                {...{
                    ...compositeProps,
                    open: state === DialogState.Opened,
                    onClose,
                    onExited,
                }}
            />
        )

    return [renderedComponent, showModal, showStatefulModal]
}

interface DashboardDialogWrapperProps {
    icon?: React.ReactElement
    iconColor?: string
    primary: string
    secondary?: string
    size?: 'small' | 'medium'
    children: React.ReactNode
}

const useDashboardDialogWrapperStyles = makeStyles((theme) =>
    createStyles<string, DashboardDialogWrapperProps>({
        wrapper: {
            width: (props) => (props.size === 'small' ? '350px' : '440px'),
            padding: (props) => theme.spacing(props.size === 'small' ? 3 : 4),
        },
        header: {
            marginTop: theme.spacing(1),
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '350px',
        },
        content: {
            marginTop: (props) => theme.spacing(props.size === 'small' && props.icon ? 4 : 2),
            textAlign: 'center',
            '& > *:not(:last-child)': {
                marginBottom: theme.spacing(2),
            },
        },
        primary: {
            margin: theme.spacing(2, 0, 1),
        },
        secondary: {
            lineHeight: 1.75,
            textAlign: 'center',
            wordBreak: 'break-word',
        },
    }),
)

const dialogTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiOutlinedInput: {
                notchedOutline: {
                    borderColor: '#EAEAEA',
                },
            },
            MuiButton: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
            },
        },
        props: {
            MuiButton: {
                size: 'medium',
            },
            MuiTextField: {
                fullWidth: true,
                variant: 'outlined',
                margin: 'normal',
            },
        },
    })

export function DashboardDialogWrapper(props: DashboardDialogWrapperProps) {
    const { icon, iconColor, primary, secondary, children } = props
    const classes = useDashboardDialogWrapperStyles(props)
    return (
        <ThemeProvider theme={dialogTheme}>
            <DialogContent className={classes.wrapper}>
                <section className={classes.header}>
                    {icon && React.cloneElement(icon, { width: 64, height: 64, stroke: iconColor })}
                    <Typography className={classes.primary} variant="h5">
                        {primary}
                    </Typography>
                    <Typography className={classes.secondary} color="textSecondary" variant="body2">
                        {secondary}
                    </Typography>
                </section>
                <section className={classes.content}>{children}</section>
            </DialogContent>
        </ThemeProvider>
    )
}

export function useSnackbarCallback<T = void>(
    executor: () => Promise<T>,
    deps: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
) {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()
    return useCallback(
        () =>
            executor().then(
                (res) => {
                    enqueueSnackbar(t('done'), { key, variant: 'success' })
                    onSuccess?.(res)
                    return res
                },
                (err) => {
                    enqueueSnackbar(`Error: ${err.message || err}`, { key })
                    onError?.(err)
                    throw err
                },
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...deps, enqueueSnackbar, executor, key, onError, onSuccess, t],
    )
}
