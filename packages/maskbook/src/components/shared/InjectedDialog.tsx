import {
    DialogActions,
    DialogClassKey,
    DialogContent,
    DialogContentProps,
    DialogProps,
    DialogTitle,
    IconButton,
    makeStyles,
    Typography,
    useTheme,
    Dialog,
    useMediaQuery,
} from '@material-ui/core'
import { Children, cloneElement } from 'react'
import { useI18N, usePortalShadowRoot } from '../../utils'
import { mergeClasses, useStylesExtends } from '../custom-ui-helper'
import { DialogDismissIconUI } from '../InjectedComponents/DialogDismissIcon'
import { ErrorBoundary } from '@masknet/shared'
import { activatedSocialNetworkUI } from '../../social-network'

const useStyles = makeStyles((theme) => ({
    dialogTitle: {
        padding: theme.spacing(1, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    dialogTitleTypography: {
        marginLeft: 6,
        verticalAlign: 'middle',
    },
    dialogBackdropRoot: {},
}))

export type InjectedDialogClassKey =
    | DialogClassKey
    | 'dialogTitle'
    | 'dialogContent'
    | 'dialogActions'
    | 'dialogTitleTypography'
    | 'dialogCloseButton'
    | 'dialogBackdropRoot'

export interface InjectedDialogProps
    extends withClasses<InjectedDialogClassKey>,
        Omit<DialogProps, 'onClose' | 'title' | 'classes'> {
    onClose?(): void
    title?: React.ReactChild
    disableBackdropClick?: boolean
    disableArrowBack?: boolean
}

export function InjectedDialog(props: InjectedDialogProps) {
    const classes = useStyles()
    const overwrite = activatedSocialNetworkUI.customization.componentOverwrite || {}
    props = overwrite.InjectedDialog?.props?.(props) ?? props
    const {
        dialogActions,
        dialogCloseButton,
        dialogContent,
        dialogTitle,
        dialogTitleTypography,
        dialogBackdropRoot,
        ...dialogClasses
    } = useStylesExtends(classes, props, overwrite.InjectedDialog?.classes)
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('xs'))

    const { children, open, disableBackdropClick, disableArrowBack, onClose, title, ...rest } = props
    const { t } = useI18N()
    const actions = CopyElementWithNewProps(children, DialogActions, { root: dialogActions })
    const content = CopyElementWithNewProps(children, DialogContent, { root: dialogContent })

    return usePortalShadowRoot((container) => (
        <Dialog
            container={container}
            fullScreen={fullScreen}
            classes={dialogClasses}
            open={open}
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
            {...rest}>
            <ErrorBoundary>
                {title ? (
                    <DialogTitle classes={{ root: dialogTitle }}>
                        <IconButton
                            classes={{ root: dialogCloseButton }}
                            aria-label={t('post_dialog__dismiss_aria')}
                            onClick={onClose}>
                            <DialogDismissIconUI disableArrowBack={disableArrowBack} />
                        </IconButton>
                        <Typography className={dialogTitleTypography} display="inline" variant="inherit">
                            {title}
                        </Typography>
                    </DialogTitle>
                ) : null}
                {content}
                {actions}
            </ErrorBoundary>
        </Dialog>
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
