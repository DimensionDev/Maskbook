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
import { makeStyles, useDialogStackConsumer, usePortalShadowRoot } from '@masknet/theme'
import { DialogDismissIconUI } from '@masknet/icons'
import { Children, cloneElement } from 'react'

import { ErrorBoundary } from '../ErrorBoundary'
import { useStylesExtends, mergeClasses } from '../../UIHelper/custom-ui-helper'

const useStyles = makeStyles()((theme) => ({
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

// TODO: overwrite according to social network UI
export function InjectedDialog(props: InjectedDialogProps) {
    const {
        dialogActions,
        dialogCloseButton,
        dialogContent,
        dialogTitle,
        dialogTitleTypography,
        dialogBackdropRoot,
        container,
        ...dialogClasses
    } = useStylesExtends(useStyles(), props)
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('xs'))

    const { children, open, disableBackdropClick, titleBarIconStyle, onClose, title, ...rest } = props
    const actions = CopyElementWithNewProps(children, DialogActions, { root: dialogActions })
    const content = CopyElementWithNewProps(children, DialogContent, { root: dialogContent })
    const { extraProps, shouldReplaceExitWithBack } = useDialogStackConsumer(open)

    return usePortalShadowRoot((container) => (
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
                    <DialogTitle classes={{ root: dialogTitle }}>
                        <IconButton
                            size="large"
                            classes={{ root: dialogCloseButton }}
                            aria-label="Dismiss"
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
