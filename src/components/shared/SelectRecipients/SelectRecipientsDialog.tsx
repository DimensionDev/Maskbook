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
import { geti18nString } from '../../../utils/i18n'
import { ProfileInList } from './ProfileInList'
import { Profile } from '../../../database'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { ProfileIdentifier } from '../../../database/type'
import { DialogDismissIconUI } from '../../InjectedComponents/DialogDismissIcon'

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
    ignoreMyself?: boolean
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
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)

    const currentIdentity = useCurrentIdentity()
    const itemsForRender = props.ignoreMyself
        ? props.items.filter(
              x =>
                  x?.linkedPersona?.fingerprint &&
                  !x.identifier.equals(currentIdentity ? currentIdentity.identifier : ProfileIdentifier.unknown),
          )
        : props.items.filter(x => x.linkedPersona?.fingerprint)

    return (
        <div ref={rootRef}>
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
                container={() => rootRef.current}
                disablePortal
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={props.onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton
                        classes={{ root: classes.close }}
                        aria-label={geti18nString('select_specific_friends_dialog__dismiss_aria')}
                        onClick={props.onClose}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="inherit">
                        {geti18nString('select_specific_friends_dialog__title')}
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <List dense>
                        {itemsForRender.map(item => (
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
                        {geti18nString('select_specific_friends_dialog__button')}
                    </Button>
                </DialogActions>
            </ResponsiveDialog>
        </div>
    )
}
