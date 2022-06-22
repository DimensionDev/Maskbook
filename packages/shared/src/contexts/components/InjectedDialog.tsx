import { EnhanceableSite, isDashboardPage, CrossIsolationMessages } from '@masknet/shared-base'
import classNames from 'classnames'
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

interface StyleProps {
    clean: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { clean }) => ({
    dialogTitle: {
        whiteSpace: 'nowrap',
        display: 'flex',
        gridTemplateColumns: '50px auto 50px',
    },
    dialogTitleWithTabs: {
        paddingBottom: '0px !important',
        rowGap: 16,
    },
    dialogTitleEndingContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    dialogContent: {
        overscrollBehavior: 'contain',
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
    tab: {
        width: '50%',
        textAlign: 'center',
        cursor: 'pointer',
        fontSize: 16,
        padding: theme.spacing(1, 0),
        fontWeight: 700,
        lineHeight: '20px',
        color: theme.palette.text.secondary,
        borderRadius: '12px 12px 0px 0px',
    },
    activeTab: {
        color: theme.palette.text.primary,
        background: theme.palette.background.paper,
        ...(theme.palette.mode === 'dark'
            ? {
                  boxShadow: '0px -15px 15px rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
              }
            : {}),
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
    disableBackdropClick?: boolean
    titleTabs?: Array<{ label: string; isActive: boolean; clickHandler(): void }>
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
        dialogTitleTypography,
        dialogTitleWithTabs,
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
                    onClose?.()
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
                            className="dashboard-dialog-title-hook"
                            classes={{
                                root: classNames(dialogTitle, titleTabs ? dialogTitleWithTabs : ''),
                            }}
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
                            {titleTabs ? (
                                <div className={dialogClasses.tabs}>
                                    {titleTabs.map((tab, i) => (
                                        <div
                                            key={i}
                                            onClick={tab.clickHandler}
                                            className={classNames(
                                                dialogClasses.tab,
                                                tab.isActive ? dialogClasses.activeTab : '',
                                            )}>
                                            {tab.label}
                                        </div>
                                    ))}
                                </div>
                            ) : null}
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
