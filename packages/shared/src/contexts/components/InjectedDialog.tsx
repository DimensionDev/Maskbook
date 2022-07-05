import { EnhanceableSite, isDashboardPage, CrossIsolationMessages } from '@masknet/shared-base'
import { ErrorBoundary, useValueRef } from '@masknet/shared-base-ui'
import { omit } from 'lodash-unified'
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
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { Children, cloneElement, useCallback } from 'react'
import { useSharedI18N } from '../../locales'
import { sharedUIComponentOverwrite, sharedUINetworkIdentifier } from '../base'
import { DialogDismissIcon } from './DialogDismissIcon'
import classnames from 'classnames'

interface StyleProps {
    clean: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { clean }) => ({
    dialogTitle: {
        whiteSpace: 'nowrap',
        display: 'flex',
        gridTemplateColumns: '50px auto 50px',
    },
    dialogTitleEndingContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    dialogTitleWithTabs: {
        paddingBottom: '0 !important',
        gridTemplateRows: '1fr 1fr',
        gridTemplateAreas: `
            ". . ."
            "tabs tabs tabs"
        `,
    },
    dialogContent: {
        overscrollBehavior: 'contain',
    },
    dialogTitleTabs: {
        gridArea: 'tabs',
    },
    dialogTitleTypography: {
        flex: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 700,
    },
    dialogCloseButton: {
        color: theme.palette.text.primary,
        padding: 0,
        width: 24,
        height: 24,
        '& > svg': {
            fontSize: 24,
        },
    },
    paper: clean ? { width: 'auto', backgroundImage: 'none' } : {},
    tabs: {
        display: 'flex',
        gridColumn: '3 span',
    },
}))

export type InjectedDialogClassKey =
    | DialogClassKey
    | 'dialogTitle'
    | 'dialogTitleEndingContent'
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
    titleTabs?: React.ReactChild | null
    disableBackdropClick?: boolean
    disableTitleBorder?: boolean
    isOpenFromApplicationBoard?: boolean
    isOnBack?: boolean
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
        dialogTitleEndingContent,
        dialogTitleTabs,
        dialogTitleWithTabs,
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
        titleTabs,
        titleTail = null,
        disableTitleBorder,
        isOpenFromApplicationBoard,
        ...rest
    } = props
    const actions = CopyElementWithNewProps(children, DialogActions, { root: dialogActions })
    const content = CopyElementWithNewProps(children, DialogContent, { root: dialogContent })
    const { extraProps, shouldReplaceExitWithBack, IncreaseStack } = useDialogStackActor(open)

    const closeBothCompositionDialog = useCallback(() => {
        if (isOpenFromApplicationBoard) {
            CrossIsolationMessages.events.requestComposition.sendToLocal({ open: false, reason: 'timeline' })
        }

        onClose?.()
    }, [isOpenFromApplicationBoard])

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
                    !props.isOnBack ? closeBothCompositionDialog() : onClose?.()
                }}
                onBackdropClick={disableBackdropClick ? void 0 : onClose}
                BackdropProps={{
                    classes: {
                        root: dialogBackdropRoot,
                    },
                }}
                {...omit(rest, 'isOnBack')}
                {...extraProps}>
                <ErrorBoundary>
                    {title ? (
                        <DialogTitle
                            className={classnames('dashboard-dialog-title-hook', titleTabs ? dialogTitleWithTabs : '')}
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
                                onClick={!props.isOnBack ? closeBothCompositionDialog : onClose}>
                                <DialogDismissIcon
                                    style={
                                        titleBarIconStyle !== 'close' && shouldReplaceExitWithBack && !isDashboard
                                            ? 'back'
                                            : titleBarIconStyle
                                    }
                                />
                            </IconButton>
                            <Typography className={dialogTitleTypography} display="inline" variant="inherit">
                                {title}
                            </Typography>
                            <Stack className={dialogTitleEndingContent}>{titleTail}</Stack>
                            {titleTabs && <Stack className={dialogTitleTabs}>{titleTabs}</Stack>}
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
