import { Children, cloneElement, useCallback, useRef } from 'react'
import { omit } from 'lodash-es'
/* eslint-disable tss-unused-classes/unused-classes */
import { EnhanceableSite, CrossIsolationMessages, Sniffings } from '@masknet/shared-base'
import { ErrorBoundary, useValueRef } from '@masknet/shared-base-ui'
import { type Cx, makeStyles, useDialogStackActor, usePortalShadowRoot } from '@masknet/theme'
import {
    Dialog,
    DialogActions,
    type DialogClassKey,
    DialogContent,
    type DialogContentProps,
    type DialogProps,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import { sharedUIComponentOverwrite, sharedUINetworkIdentifier } from '../base/index.js'
import { DialogDismissIcon } from './DialogDismissIcon.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface StyleProps {
    clean: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { clean }) => ({
    dialogTitle: {
        whiteSpace: 'nowrap',
        display: 'flex',
        gridTemplateColumns: '50px auto 50px',
        background: Sniffings.is_dashboard_page ? theme.palette.maskColor.modalTitleBg : undefined,
    },

    dialogTitleEndingContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    dialogTitleWithTabs: {
        display: 'grid !important',
        paddingBottom: '0 !important',
        paddingLeft: '0 !important',
        paddingRight: '0 !important',
        gridTemplateRows: `${theme.spacing(3.5)} ${theme.spacing(1.5)} ${theme.spacing(4.5)}`,
        gridTemplateAreas: `
            ". . ."
            "gap gap gap"
            "titleTab titleTab titleTab"
            "networkTab networkTab networkTab"
        `,
    },
    dialogContent: {
        background: Sniffings.is_dashboard_page ? theme.palette.maskColor.bottom : undefined,
        overscrollBehavior: 'contain',
    },
    dialogActions: {
        background: Sniffings.is_dashboard_page ? theme.palette.maskColor.secondaryBottom : undefined,
        boxShadow: Sniffings.is_dashboard_page ? theme.palette.maskColor.bottomBg : undefined,
        backdropFilter: Sniffings.is_dashboard_page ? 'blur(8px)' : undefined,
    },
    dialogGap: {
        gridArea: 'gap',
    },
    dialogTitleTabs: {
        paddingLeft: '16px !important',
        paddingRight: '16px !important',
        gridArea: 'titleTab',
    },
    dialogNetworkTabs: {
        gridArea: 'networkTab',
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
    dialogCloseButtonWithTabs: {
        marginLeft: 16,
    },
    dialogTitleEndingContentWithTabs: {
        marginRight: 16,
    },
    paper:
        clean ?
            {
                width: 'auto',
                backgroundImage: 'none',
                maxHeight: 620,
            }
        :   {
                maxHeight: 620,
            },
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
    title?: React.ReactNode
    titleTail?: React.ReactNode | null
    titleTabs?: React.ReactNode | null
    networkTabs?: React.ReactNode | null
    disableBackdropClick?: boolean
    disableTitleBorder?: boolean
    isOpenFromApplicationBoard?: boolean
    isOnBack?: boolean
    independent?: boolean
    titleBarIconStyle?: 'auto' | 'back' | 'close'
}

export function InjectedDialog(props: InjectedDialogProps) {
    const { _ } = useLingui()
    const site = useValueRef(sharedUINetworkIdentifier)
    const overwrite = useValueRef(sharedUIComponentOverwrite)
    const clean = site === EnhanceableSite.Minds || site === EnhanceableSite.Facebook

    const useSiteOverwrite = useRef(overwrite.InjectedDialog?.classes || (() => ({ classes: undefined }))).current
    const siteOverwrite = useSiteOverwrite().classes
    const styles = useStyles({ clean }, { props })
    const cx = styles.cx
    const classes = { ...styles.classes }
    if (siteOverwrite) {
        for (const [key, className] of Object.entries(siteOverwrite)) {
            if (key in classes) Reflect.set(classes, key, cx(Reflect.get(classes, key), String(className)))
            else Reflect.set(classes, key, String(className))
        }
    }
    const {
        dialogActions,
        dialogCloseButton,
        dialogContent,
        dialogTitle,
        dialogTitleEndingContent,
        dialogTitleEndingContentWithTabs,
        dialogTitleTabs,
        dialogNetworkTabs,
        dialogTitleWithTabs,
        dialogCloseButtonWithTabs,
        dialogGap,
        dialogTitleTypography,
        dialogBackdropRoot,
        container,
        ...dialogClasses
    } = classes
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('xs'))
    const {
        children,
        open,
        disableBackdropClick,
        titleBarIconStyle,
        onClose,
        title,
        titleTabs,
        networkTabs,
        titleTail = null,
        disableTitleBorder,
        isOpenFromApplicationBoard,
        independent,
        ...rest
    } = props
    const actions = CopyElementWithNewProps(children, DialogActions, { root: dialogActions }, cx)
    const content = CopyElementWithNewProps(children, DialogContent, { root: dialogContent }, cx)
    const { extraProps, shouldReplaceExitWithBack, TrackDialogHierarchy } = useDialogStackActor(open)

    const closeBothCompositionDialog = useCallback(() => {
        if (isOpenFromApplicationBoard) {
            CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
                open: false,
                reason: 'popup',
                options: { isOpenFromApplicationBoard },
            })
            CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
                open: false,
                reason: 'timeline',
                options: { isOpenFromApplicationBoard },
            })
        }
        onClose?.()
    }, [isOpenFromApplicationBoard, onClose])

    return usePortalShadowRoot((container) => (
        <TrackDialogHierarchy>
            <Dialog
                container={container}
                fullScreen={fullScreen}
                classes={dialogClasses}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                onClose={(event, reason) => {
                    if (reason === 'backdropClick' && disableBackdropClick) return
                    !props.isOnBack ? closeBothCompositionDialog() : onClose?.()
                }}
                BackdropProps={{
                    transitionDuration: 0,
                    classes: {
                        root: dialogBackdropRoot,
                    },
                }}
                {...omit(rest, 'isOnBack')}
                {...(independent ? omit(extraProps, 'hidden', 'style', 'aria-hidden') : extraProps)}>
                <ErrorBoundary>
                    {title ?
                        <DialogTitle
                            className={cx(titleTabs ? dialogTitleWithTabs : '')}
                            classes={{ root: dialogTitle }}>
                            <IconButton
                                size="large"
                                disableTouchRipple
                                classes={{ root: cx(dialogCloseButton, titleTabs ? dialogCloseButtonWithTabs : '') }}
                                aria-label={_(msg`Dismiss`)}
                                onClick={!props.isOnBack ? closeBothCompositionDialog : onClose}>
                                <DialogDismissIcon
                                    style={
                                        (
                                            titleBarIconStyle !== 'close' &&
                                            shouldReplaceExitWithBack &&
                                            !Sniffings.is_dashboard_page
                                        ) ?
                                            'back'
                                        :   titleBarIconStyle
                                    }
                                />
                            </IconButton>
                            <Typography className={dialogTitleTypography} display="inline" variant="inherit">
                                {title}
                            </Typography>
                            <Stack
                                className={cx(
                                    dialogTitleEndingContent,
                                    titleTabs ? dialogTitleEndingContentWithTabs : '',
                                )}>
                                {titleTail}
                            </Stack>
                            {/* If you want to apply different size gaps between rows, then consider using actual rows for the job, since you cannot apply different widths to different gaps  */}
                            {titleTabs ?
                                <Stack className={dialogGap} />
                            :   null}
                            {titleTabs ?
                                <Stack className={dialogTitleTabs}>{titleTabs}</Stack>
                            :   null}
                            {networkTabs ?
                                <Stack className={dialogNetworkTabs}>{networkTabs}</Stack>
                            :   null}
                        </DialogTitle>
                    :   null}

                    {/* There is a .MuiDialogTitle+.MuiDialogContent selector that provides paddingTop: 0 */}
                    {/* Add an empty span here to revert this effect. */}
                    <span />
                    {content}
                    {actions}
                </ErrorBoundary>
            </Dialog>
        </TrackDialogHierarchy>
    ))
}
function CopyElementWithNewProps<T>(
    children: React.ReactNode,
    Target: React.ComponentType<T>,
    extraClasses: T extends { classes?: infer Q } ? Q : never,
    cx: Cx,
) {
    return (
        Children.map(children, (child: any) => {
            const allKeys = new Set([...Object.keys(extraClasses as any), ...Object.keys(child?.props?.classes ?? {})])
            const result: Record<string, string> = {}

            for (const key of allKeys) {
                result[key] = cx((extraClasses as any)[key], child?.props?.classes?.[key])
            }
            return child?.type === Target ?
                    cloneElement(child, {
                        classes: result,
                    } as DialogContentProps)
                :   null
        }) || []
    ).filter(Boolean)
}
