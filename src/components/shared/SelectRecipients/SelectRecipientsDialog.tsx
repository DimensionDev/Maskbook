import * as React from 'react'
import { useRef } from 'react'
import {
    List,
    makeStyles,
    Typography,
    Button,
    IconButton,
    withMobileDialog,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@material-ui/core'
import { useStylesExtends } from '../../custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ProfileInList } from './ProfileInList'
import { Profile } from '../../../database'
import { DialogDismissIconUI } from '../../InjectedComponents/DialogDismissIcon'
import { PortalShadowRoot } from '../../../utils/jss/ShadowRootPortal'

const useStyles = makeStyles(theme => ({
    content: {
        padding: '0 !important',
    },
    title: {
        marginLeft: 6,
    },
}))
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export interface SelectRecipientsDialogUIProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'header'
        | 'actions'
        | 'close'
        | 'button'
    > {
    open: boolean
    items: Profile[]
    selected: Profile[]
    disabled: boolean
    submitDisabled: boolean
    onSubmit: () => void
    onClose: () => void
    onSelect: (item: Profile) => void
    onDeselect: (item: Profile) => void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { items } = props

    return (
        <ResponsiveDialog
            className={classes.dialog}
            classes={{
                container: classes.container,
                paper: classes.paper,
            }}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            container={PortalShadowRoot}
            disableAutoFocus
            disableEnforceFocus
            onEscapeKeyDown={props.onClose}
            BackdropProps={{
                className: classes.backdrop,
            }}>
            <DialogTitle className={classes.header}>
                <IconButton
                    classes={{ root: classes.close }}
                    aria-label={t('select_specific_friends_dialog__dismiss_aria')}
                    onClick={props.onClose}>
                    <DialogDismissIconUI />
                </IconButton>
                <Typography className={classes.title} display="inline" variant="inherit">
                    {t('select_specific_friends_dialog__title')}
                </Typography>
            </DialogTitle>
            <DialogContent className={classes.content}>
                <List dense>
                    {items.map(item => (
                        <ProfileInList
                            key={item.identifier.toText()}
                            item={item}
                            checked={props.selected.some(x => x.identifier.equals(item.identifier))}
                            disabled={props.disabled}
                            onChange={(_, checked) => {
                                if (checked) {
                                    props.onSelect(item)
                                } else {
                                    props.onDeselect(item)
                                }
                            }}
                        />
                    ))}
                </List>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button
                    className={classes.button}
                    style={{ marginLeft: 'auto' }}
                    color="primary"
                    variant="contained"
                    disabled={props.submitDisabled}
                    onClick={props.onSubmit}>
                    {t('select_specific_friends_dialog__button')}
                </Button>
            </DialogActions>
        </ResponsiveDialog>
    )
}
