import { EnhanceableSite, isDashboardPage } from '@masknet/shared-base'
import { ErrorBoundary, useValueRef } from '@masknet/shared-base-ui'
import { makeStyles, mergeClasses, useDialogStackActor, usePortalShadowRoot, useStylesExtends } from '@masknet/theme'
import {
    Dialog,
    DialogActions,
    DialogClassKey,
    DialogContent,
    DialogContentProps,
    DialogProps,
    DialogTitle,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { Children, cloneElement } from 'react'
import { useSharedI18N } from '../../locales'
import { sharedUIComponentOverwrite, sharedUINetworkIdentifier } from '../base'
import { DialogDismissIcon } from './DialogDismissIcon'

interface StyleProps {
    clean: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { clean }) => ({
    dialogTitle: {
        padding: theme.spacing(1, 2),
        whiteSpace: 'nowrap',
    },
    dialogContent: {
        overscrollBehavior: 'contain',
    },
    dialogTitleTypography: {
        flex: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
    },
    dialogCloseButton: {
        color: theme.palette.text.primary,
        position: 'absolute',
        padding: 0,
        width: 24,
        height: 24,
        '& > svg': {
            fontSize: 24,
        },
    },
    paper: clean ? { width: 'auto', backgroundImage: 'none' } : {},
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
    titleTail?: React.ReactChild | null
    disableBackdropClick?: boolean
    disableTitleBorder?: boolean
    titleBarIconStyle?: 'auto' | 'back' | 'close'
}

export function InjectedDialog(props: InjectedDialogProps) {
    const snsId = useValueRef(sharedUINetworkIdentifier)
    const overwrite = useValueRef(sharedUIComponentOverwrite)
    props = overwrite.InjectedDialog?.props?.(props) ?? props
    const clean = snsId === EnhanceableSite.Minds || snsId === EnhanceableSite.Facebook
    const {
        dialogActions,
        dialogCloseButton,
        dialogContent,
        dialogTitle,
        dialogTitleTypography,
        dialogBackdropRoot,
        container,
        ...dialogClasses
    } = useStylesExtends(useStyles({ clean }), props, overwrite.InjectedDialog?.classes)

    const t = useSharedI18N()
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('xs'))
    const isDashboard = isDashboardPage()
    const {
        children,
        open,
        disableBackdropClick,
        titleBarIconStyle,
        onClose,
        title,
        titleTail = null,
        disableTitleBorder,
        ...rest
    } = props
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
                        <DialogTitle
                            className="dashboard-dialog-title-hook"
                            classes={{ root: dialogTitle }}
                            style={{
                                border: isDashboard || disableTitleBorder ? 'none' : undefined,
                                fontSize: isDashboard ? 24 : undefined,
                            }}>
                            <IconButton
                                size="large"
                                disableRipple
                                classes={{ root: dialogCloseButton }}
                                aria-label={t.dialog_dismiss()}
                                onClick={onClose}>
                                <DialogDismissIcon
                                    style={shouldReplaceExitWithBack && !isDashboard ? 'back' : titleBarIconStyle}
                                />
                            </IconButton>
                            <Typography className={dialogTitleTypography} display="inline" variant="inherit">
                                {title}
                            </Typography>
                            {titleTail}
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
                      classes: mergeClasses(extraClasses as any, child.props.classes),
                  } as DialogContentProps)
                : null,
        ) || []
    ).filter(Boolean)
}
