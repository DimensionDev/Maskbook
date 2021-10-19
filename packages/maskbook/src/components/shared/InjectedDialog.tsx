import {
    DialogActions,
    DialogClassKey,
    DialogContent,
    DialogContentProps,
    DialogProps,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
    Dialog,
    useMediaQuery,
} from '@material-ui/core'
import { makeStyles, useDialogStackActor } from '@masknet/theme'
import { Children, cloneElement } from 'react'
import { useI18N, usePortalShadowRoot } from '../../utils'
import { DialogDismissIconUI } from '../InjectedComponents/DialogDismissIcon'
import { ErrorBoundary, useStylesExtends, mergeClasses } from '@masknet/shared'
import { activatedSocialNetworkUI } from '../../social-network'
import { MINDS_ID } from '../../social-network-adaptor/minds.com/base'
import { FACEBOOK_ID } from '../../social-network-adaptor/facebook.com/base'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    dialogTitle: {
        padding: theme.spacing(1, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    dialogTitleTypography: {
        marginLeft: 6,
        verticalAlign: 'middle',
    },
    dialogBackdropRoot: {},
    dialogCloseButton: {
        color: theme.palette.text.primary,
    },
    paper: {
        ...(snsId === MINDS_ID || snsId === FACEBOOK_ID ? { width: 'auto', backgroundImage: 'none' } : {}),
    },
}))

export type InjectedDialogClassKey =
    | DialogClassKey
    | 'dialogTitle'
    | 'dialogContent'
    | 'dialogActions'
    | 'dialogTitleTypography'
    | 'dialogCloseButton'
    | 'dialogBackdropRoot'

export interface InjectedDialogProps extends Omit<DialogProps, 'onClose' | 'title' | 'classes'> {
    classes?: Partial<Record<InjectedDialogClassKey, string>>
    onClose?(): void
    title?: React.ReactChild
    disableBackdropClick?: boolean
    titleBarIconStyle?: 'auto' | 'back' | 'close'
}

export function InjectedDialog(props: InjectedDialogProps) {
    const overwrite = activatedSocialNetworkUI.customization.componentOverwrite || {}
    props = overwrite.InjectedDialog?.props?.(props) ?? props
    const {
        dialogActions,
        dialogCloseButton,
        dialogContent,
        dialogTitle,
        dialogTitleTypography,
        dialogBackdropRoot,
        container,
        ...dialogClasses
    } = useStylesExtends(
        useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier }),
        props,
        overwrite.InjectedDialog?.classes,
    )
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('xs'))

    const { children, open, disableBackdropClick, titleBarIconStyle, onClose, title, ...rest } = props
    const { t } = useI18N()
    const actions = CopyElementWithNewProps(children, DialogActions, { root: dialogActions })
    const content = CopyElementWithNewProps(children, DialogContent, { root: dialogContent })
    const { extraProps, shouldReplaceExitWithBack, IncreaseStack } = useDialogStackActor(open)

    return usePortalShadowRoot((container) => (
        <IncreaseStack>
            <Dialog
                container={container}
                fullScreen={fullScreen}
                classes={dialogClasses}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onClose={(event, reason) => {
                    if (reason === 'backdropClick' && disableBackdropClick) return
                    onClose?.()
                }}
                onBackdropClick={disableBackdropClick ? void 0 : onClose}
                BackdropProps={{
                    classes: {
                        root: dialogBackdropRoot,
                    },
                }}
                {...rest}
                {...extraProps}>
                <ErrorBoundary>
                    {title ? (
                        <DialogTitle className="dashboard-dialog-title-hook" classes={{ root: dialogTitle }}>
                            <IconButton
                                size="large"
                                classes={{ root: dialogCloseButton }}
                                aria-label={t('post_dialog__dismiss_aria')}
                                onClick={onClose}>
                                <DialogDismissIconUI style={shouldReplaceExitWithBack ? 'back' : titleBarIconStyle} />
                            </IconButton>
                            <Typography className={dialogTitleTypography} display="inline" variant="inherit">
                                {title}
                            </Typography>
                        </DialogTitle>
                    ) : null}
                    {/* There is a .MuiDialogTitle+.MuiDialogContent selector that provides paddingTop: 0 */}
                    {/* Add an empty span here to revert this effect. */}
                    <span />
                    {content}
                    {actions}
                </ErrorBoundary>
            </Dialog>
        </IncreaseStack>
    ))
}
function CopyElementWithNewProps<T>(
    children: React.ReactNode,
    Target: React.ComponentType<T>,
    // @ts-ignore
    extraClasses: T['classes'],
) {
    return (
        Children.map(children, (child: any) =>
            child?.type === Target
                ? cloneElement(child, {
                      classes: mergeClasses(extraClasses, child.props.classes),
                  } as DialogContentProps)
                : null,
        ) || []
    ).filter(Boolean)
}
