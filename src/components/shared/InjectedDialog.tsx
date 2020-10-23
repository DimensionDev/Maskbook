import {
    DialogActions,
    DialogClassKey,
    DialogContent,
    DialogContentProps,
    DialogTitle,
    IconButton,
    Typography,
} from '@material-ui/core'
import React from 'react'
import { useI18N } from '../../utils/i18n-next-ui'
import ShadowRootDialog from '../../utils/shadow-root/ShadowRootDialog'
import { getCustomUIOverwrite, mergeClasses, useStylesExtends } from '../custom-ui-helper'
import { DialogDismissIconUI } from '../InjectedComponents/DialogDismissIcon'

export type InjectedDialogClassKey =
    | DialogClassKey
    | 'dialogTitle'
    | 'dialogContent'
    | 'dialogActions'
    | 'dialogTitleTypography'
    | 'dialogCloseButton'
export interface InjectedDialogProps extends withClasses<InjectedDialogClassKey>, React.PropsWithChildren<{}> {
    open: boolean
    onExit?(): void
    title: React.ReactChild
}
export function InjectedDialog(props: InjectedDialogProps) {
    const overwrite = getCustomUIOverwrite()
    props = overwrite.InjectedDialog?.props?.(props) ?? props
    const {
        dialogActions,
        dialogCloseButton,
        dialogContent,
        dialogTitle,
        dialogTitleTypography,
        ...classes
    } = useStylesExtends({}, props, overwrite.InjectedDialog?.classes)
    const { t } = useI18N()
    const actions = CopyElementWithNewProps(props.children, DialogActions, { root: dialogActions })
    const content = CopyElementWithNewProps(props.children, DialogContent, { root: dialogContent })

    return (
        <ShadowRootDialog
            classes={classes}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            disableAutoFocus
            disableEnforceFocus
            onBackdropClick={props.onExit}
            onEscapeKeyDown={props.onExit}>
            <DialogTitle classes={{ root: dialogTitle }}>
                <IconButton
                    classes={{ root: dialogCloseButton }}
                    aria-label={t('post_dialog__dismiss_aria')}
                    onClick={props.onExit}>
                    <DialogDismissIconUI />
                </IconButton>
                <Typography className={dialogTitleTypography} display="inline" variant="inherit">
                    {props.title}
                </Typography>
            </DialogTitle>
            {content}
            {actions}
        </ShadowRootDialog>
    )
}
function CopyElementWithNewProps<T>(
    children: React.ReactNode,
    Target: React.ComponentType<T>,
    // @ts-ignore
    extraClasses: T['classes'],
) {
    return (
        React.Children.map(children, (child: any) =>
            child?.type === Target
                ? React.cloneElement(child, {
                      classes: mergeClasses(extraClasses, child.props.classes),
                  } as DialogContentProps)
                : null,
        ) || []
    ).filter(Boolean)
}
