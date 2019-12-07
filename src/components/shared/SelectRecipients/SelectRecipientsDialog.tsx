import { useRef } from 'react'
import {
    List,
    makeStyles,
    Card,
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
import { Person } from '../../../database'

const useStyles = makeStyles(theme => ({
    modal: {},
    backdrop: {},
    root: {
        outline: 'none',
        backgroundColor: theme.palette.background.paper,
    },
    header: {},
    content: {
        padding: 0,
    },
    actions: {},
    title: {
        marginLeft: 6,
        verticalAlign: 'middle',
    },
    close: {},
    button: {},
}))
const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export interface SelectRecipientsDialogUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    open: boolean
    items: Person[]
    disabled: boolean
    submitDisabled: boolean
    onSubmit: () => void
    onClose: () => void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)

    return (
        <div ref={rootRef}>
            <ResponsiveDialog
                className={classes.modal}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                container={() => rootRef.current}
                BackdropProps={{
                    className: classes.backdrop,
                }}
                onEscapeKeyDown={props.onClose}
                onBackdropClick={props.onClose}>
                <DialogTitle className={classes.header}>
                    <IconButton
                        classes={{ root: classes.close }}
                        aria-label={geti18nString('post_modal__dismiss_aria')}
                        onClick={props.onClose}>
                        <CloseIcon />
                    </IconButton>
                    <Typography className={classes.title} display="inline" variant="h6">
                        {geti18nString('recipients_modal__title')}
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <List dense>
                        {props.items.map(item => (
                            <ProfileInList
                                checked={true}
                                item={item}
                                key={item.identifier.toText()}
                                disabled={props.disabled}
                                onChange={() => {}}
                                onClick={() => {}}
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
                        {geti18nString('recipients_modal__button')}
                    </Button>
                </DialogActions>
            </ResponsiveDialog>
        </div>
    )
}
