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
import { useStylesExtends, or } from '../../custom-ui-helper'
import { geti18nString } from '../../../utils/i18n'
import CloseIcon from '@material-ui/icons/Close'
import { ProfileInList } from './ProfileInList'
import { Person, Group } from '../../../database'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'

const useStyles = makeStyles(theme => ({
    dialog: {},
    backdrop: {},
    paper: {},
    header: {},
    content: {
        padding: 0,
    },
    actions: {},
    title: {
        marginLeft: 6,
    },
    close: {},
    button: {},
}))
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export interface SelectRecipientsDialogUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    ignoreMyself?: boolean
    open: boolean
    items: Person[]
    selected: Person[]
    disabled: boolean
    submitDisabled: boolean
    onSubmit: () => void
    onClose: () => void
    onSelect: (item: Person) => void
    onDeselect: (item: Person) => void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)

    const myself = useCurrentIdentity()
    const itemsForRender = props.ignoreMyself
        ? props.items.filter(x => !x.identifier.equals(myself?.identifier!))
        : props.items

    return (
        <div ref={rootRef}>
            <ResponsiveDialog
                className={classes.dialog}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                container={() => rootRef.current}
                disablePortal
                onEscapeKeyDown={props.onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}
                PaperProps={{
                    className: classes.paper,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton
                        classes={{ root: classes.close }}
                        aria-label={geti18nString('select_specific_friends_dialog__dismiss_aria')}
                        onClick={props.onClose}>
                        <CloseIcon />
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
