import React, { useMemo, useCallback, useReducer } from 'react'
import classNames from 'classnames'
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
    FadeProps,
    SvgIconProps,
} from '@material-ui/core'
import { Theme, ThemeProvider } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import type { TransitionProps } from '@material-ui/core/transitions'
import { useBlurContext } from '../DashboardContexts/BlurContext'
import { useSnackbar } from 'notistack'
import { useI18N } from '../../../utils/i18n-next-ui'
import { merge, cloneDeep } from 'lodash-es'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { appearanceSettings, Appearance } from '../../../components/shared-settings/settings'
import { MaskbookLightTheme, MaskbookDarkTheme } from '../../../utils/theme'

const Transition = React.forwardRef<unknown, TransitionProps & Pick<FadeProps, 'children'>>(function Transition(
    props,
    ref,
) {
    return <Fade ref={ref} {...props} />
})

const useStyles = makeStyles((theme) =>
    createStyles({
        close: {
            color: theme.palette.text.primary,
            position: 'absolute',
            right: 10,
            top: 10,
        },
    }),
)

export interface DashboardDialogCoreProps extends DialogProps {
    CloseIconProps?: Partial<SvgIconProps>
}

export function DashboardDialogCore(props: DashboardDialogCoreProps) {
    const { fullScreen, children, CloseIconProps, ...dialogProps } = props

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
                className={classes.close}
                onClick={(e) => dialogProps.onClose?.(e, 'backdropClick')}
                size="small">
                <CloseIcon {...CloseIconProps} />
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

    const preferDarkScheme = useMediaQuery('(prefers-color-scheme: dark)')
    const appearance = useValueRef(appearanceSettings)
    const renderedComponent =
        state === DialogState.Destroyed ? null : (
            <ThemeProvider
                theme={
                    (preferDarkScheme && appearance === Appearance.default) || appearance === Appearance.dark
                        ? MaskbookDarkTheme
                        : MaskbookLightTheme
                }>
                <Modal
                    {...{
                        ...compositeProps,
                        open: state === DialogState.Opened,
                        onClose,
                        onExited,
                    }}
                />
            </ThemeProvider>
        )

    return [renderedComponent, showModal, showStatefulModal]
}

const useDashboardDialogWrapperStyles = makeStyles((theme) =>
    createStyles<string, DashboardDialogWrapperProps>({
        wrapper: {
            display: 'flex',
            flexDirection: 'column',
            width: (props) => (props.size === 'small' ? 280 : 440),
            padding: (props) => (props.size === 'small' ? '40px 24px !important' : '40px 36px !important'),
        },
        header: {
            textAlign: 'center',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        content: {
            flex: 1,
            textAlign: 'center',
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: theme.spacing(3),
        },
        primary: {
            margin: theme.spacing(2, 0, 1),
            fontWeight: 500,
            fontSize: 20,
            lineHeight: '30px',
        },
        secondary: {
            lineHeight: 1.75,
            fontSize: 14,
            textAlign: 'center',
            wordBreak: 'break-word',
            marginBottom: 18,
        },
        confineSecondary: {
            paddingLeft: (props) => (props.size === 'small' ? 24 : 46),
            paddingRight: (props) => (props.size === 'small' ? 24 : 46),
        },
    }),
)

const dialogTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiOutlinedInput: {
                input: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                multiline: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                notchedOutline: {
                    borderColor: '#EAEAEA',
                },
            },
            MuiInputLabel: {
                outlined: {
                    transform: 'translate(14px, 16px) scale(1)',
                },
            },
            MuiAutocomplete: {
                root: {
                    marginTop: theme.spacing(2),
                },
                inputRoot: {
                    paddingTop: '5px !important',
                    paddingBottom: '5px !important',
                },
            },
            MuiTextField: {
                root: {
                    marginTop: theme.spacing(2),
                    marginBottom: 0,

                    '&:first-child': {
                        marginTop: 0,
                    },
                },
            },
            MuiButton: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
            },
            MuiTabs: {
                root: {
                    minHeight: 38,
                },
                indicator: {
                    height: 1,
                },
            },
            MuiTab: {
                root: {
                    minHeight: 38,
                    borderBottom: `solid 1px ${theme.palette.divider}`,
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

interface DashboardDialogWrapperProps {
    icon?: React.ReactElement
    iconColor?: string
    primary: string
    secondary?: string
    size?: 'small' | 'medium'
    content?: React.ReactNode
    footer?: React.ReactNode
}

export function DashboardDialogWrapper(props: DashboardDialogWrapperProps) {
    const { size, icon, iconColor, primary, secondary, content, footer } = props
    const classes = useDashboardDialogWrapperStyles(props)
    return (
        <ThemeProvider theme={dialogTheme}>
            <DialogContent className={classes.wrapper}>
                <section className={classes.header}>
                    {icon && React.cloneElement(icon, { width: 64, height: 64, stroke: iconColor })}
                    <Typography className={classes.primary} variant="h5">
                        {primary}
                    </Typography>
                    <Typography
                        className={classNames(classes.secondary, size !== 'small' ? classes.confineSecondary : '')}
                        color="textSecondary"
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: secondary ?? '' }}></Typography>
                </section>
                {content ? <section className={classes.content}>{content}</section> : null}
                {footer ? <section className={classes.footer}>{footer}</section> : null}
            </DialogContent>
        </ThemeProvider>
    )
}

export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    executor: P,
    deps: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
) {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()
    return useCallback(
        (...args) =>
            executor(...args).then(
                (res) => {
                    enqueueSnackbar(t('done'), { key, variant: 'success', preventDuplicate: true })
                    onSuccess?.(res)
                    return res
                },
                (err) => {
                    enqueueSnackbar(`Error: ${err.message || err}`, { key, preventDuplicate: true })
                    onError?.(err)
                    throw err
                },
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...deps, enqueueSnackbar, executor, key, onError, onSuccess, t],
    )
}
