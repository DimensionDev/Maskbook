import { cloneElement, useCallback, useReducer } from 'react'
import classNames from 'classnames'
import {
    DialogProps,
    Dialog,
    IconButton,
    DialogContent,
    Typography,
    SvgIconProps,
    IconButtonProps,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ThemeProvider } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { extendsTheme, useClassicMaskTheme, useMatchXS } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        userSelect: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    close: {
        color: theme.palette.text.primary,
        position: 'absolute',
        right: 10,
        top: 10,
    },
}))

export interface DashboardDialogCoreProps extends DialogProps {
    CloseIconProps?: Partial<SvgIconProps>
    CloseButtonProps?: Partial<IconButtonProps>
}

export function DashboardDialogCore(props: DashboardDialogCoreProps) {
    const { fullScreen, children, CloseIconProps, CloseButtonProps, ...dialogProps } = props

    const { classes } = useStyles()
    const xsMatched = useMatchXS()

    return (
        <Dialog className={classes.root} fullScreen={fullScreen ?? xsMatched} hideBackdrop {...dialogProps}>
            {children}
            <IconButton
                className={classes.close}
                onClick={(e) => dialogProps.onClose?.(e, 'backdropClick')}
                size="small"
                {...CloseButtonProps}>
                <CloseIcon {...CloseIconProps} />
            </IconButton>
        </Dialog>
    )
}

export interface WrappedDialogProps<T extends object = any> extends DialogProps {
    ComponentProps?: T
    onClose(): void
}
enum DialogState {
    Opened = 1,
    Closing = 2,
    Destroyed = 3,
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
    Modal: React.FunctionComponent<WrappedDialogProps<DialogProps>>,
    ComponentProps?: DialogProps,
): [React.ReactNode, () => void, (props: AdditionalPropsAppendByDispatch) => void] {
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

    const modalProps: WrappedDialogProps<DialogProps> = {
        TransitionProps: { onExited },
        ...compositeProps,
        open: state === DialogState.Opened,
        onClose,
    }
    const theme = useClassicMaskTheme()
    const renderedComponent =
        state === DialogState.Destroyed ? null : (
            <ThemeProvider theme={theme}>
                <Modal {...modalProps} />
            </ThemeProvider>
        )

    return [renderedComponent, showModal, showStatefulModal]
}

const useDashboardDialogWrapperStyles = makeStyles<DashboardDialogWrapperProps>()((theme, props) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100%',
        width: props.size === 'small' ? 280 : 440,
        padding: props.size === 'small' ? '40px 24px !important' : '40px 36px !important',
        margin: '0 auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
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
        paddingLeft: props.size === 'small' ? 24 : 46,
        paddingRight: props.size === 'small' ? 24 : 46,
    },
}))

const dialogTheme = extendsTheme((theme) => ({
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                multiline: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    marginTop: theme.spacing(2),
                },
                inputRoot: {
                    paddingTop: '5px !important',
                    paddingBottom: '5px !important',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginTop: theme.spacing(2),
                    marginBottom: 0,
                    '&:first-child': {
                        marginTop: 0,
                    },
                },
            },
            defaultProps: {
                fullWidth: true,
                variant: 'outlined',
                margin: 'normal',
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
            },
            defaultProps: { size: 'medium' },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 38,
                },
                indicator: {
                    height: 1,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 38,
                    borderBottom: `solid 1px ${theme.palette.divider}`,
                },
            },
        },
    },
}))

interface DashboardDialogWrapperProps extends withClasses<'wrapper'> {
    icon?: React.ReactElement
    iconColor?: string
    primary: string
    secondary?: string
    constraintSecondary?: boolean
    size?: 'small' | 'medium'
    content?: React.ReactNode
    footer?: React.ReactNode
}

export function DashboardDialogWrapper(props: DashboardDialogWrapperProps) {
    const { size, icon, iconColor, primary, secondary, constraintSecondary = true, content, footer } = props
    const { classes } = useDashboardDialogWrapperStyles(props)
    return (
        <ThemeProvider theme={dialogTheme}>
            <DialogContent className={classes.wrapper}>
                <section className={classes.header}>
                    {icon && cloneElement(icon, { width: 64, height: 64, stroke: iconColor })}
                    <Typography className={classes.primary} variant="h5">
                        {primary}
                    </Typography>
                    <Typography
                        className={classNames(
                            classes.secondary,
                            size !== 'small' && constraintSecondary ? classes.confineSecondary : '',
                        )}
                        color="textSecondary"
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: secondary ?? '' }}
                    />
                </section>
                {content ? <section className={classes.content}>{content}</section> : null}
                {footer ? <section className={classes.footer}>{footer}</section> : null}
            </DialogContent>
        </ThemeProvider>
    )
}
