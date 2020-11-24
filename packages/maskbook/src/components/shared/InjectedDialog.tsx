import {
    createStyles,
    DialogActions,
    DialogClassKey,
    DialogContent,
    DialogContentProps,
    DialogProps,
    DialogTitle,
    IconButton,
    makeStyles,
    Typography,
} from '@material-ui/core'
import { Children, cloneElement } from 'react'
import { useI18N } from '../../utils/i18n-next-ui'
import ShadowRootDialog from '../../utils/shadow-root/ShadowRootDialog'
import { getCustomUIOverwrite, mergeClasses, useStylesExtends } from '../custom-ui-helper'
import { DialogDismissIconUI } from '../InjectedComponents/DialogDismissIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        dialogTitle: {
            padding: theme.spacing(1, 2),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        dialogTitleTypography: {
            marginLeft: 6,
            verticalAlign: 'middle',
        },
    }),
)

export type InjectedDialogClassKey =
    | DialogClassKey
    | 'dialogTitle'
    | 'dialogContent'
    | 'dialogActions'
    | 'dialogTitleTypography'
    | 'dialogCloseButton'
    | 'dialogBackdropRoot'
export interface InjectedDialogProps extends withClasses<InjectedDialogClassKey>, React.PropsWithChildren<{}> {
    open: boolean
    onClose?(): void
    title?: React.ReactChild
    DialogProps?: Partial<DialogProps>
}
export function InjectedDialog(props: InjectedDialogProps) {
    const classes = useStyles()
    const overwrite = getCustomUIOverwrite()
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

    const { t } = useI18N()
    const actions = CopyElementWithNewProps(props.children, DialogActions, { root: dialogActions })
    const content = CopyElementWithNewProps(props.children, DialogContent, { root: dialogContent })

    return (
        <ShadowRootDialog
            classes={dialogClasses}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            disableAutoFocus
            disableEnforceFocus
            onBackdropClick={props.DialogProps?.disableBackdropClick ? void 0 : props.onClose}
            onEscapeKeyDown={props.onClose}
            BackdropProps={{
                classes: {
                    root: dialogBackdropRoot,
                },
            }}
            {...props.DialogProps}>
            {props.title ? (
                <DialogTitle classes={{ root: dialogTitle }}>
                    <IconButton
                        classes={{ root: dialogCloseButton }}
                        aria-label={t('post_dialog__dismiss_aria')}
                        onClick={props.onClose}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={dialogTitleTypography} display="inline" variant="inherit">
                        {props.title}
                    </Typography>
                </DialogTitle>
            ) : null}
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
        Children.map(children, (child: any) =>
            child?.type === Target
                ? cloneElement(child, {
                      classes: mergeClasses(extraClasses, child.props.classes),
                  } as DialogContentProps)
                : null,
        ) || []
    ).filter(Boolean)
}
