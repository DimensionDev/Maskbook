import { useRef, useState, useCallback } from 'react'
import { Modal, makeStyles, Card, CardHeader, Typography, CardContent, CardActions, Button } from '@material-ui/core'
import { useStylesExtends, or } from '../../custom-ui-helper'
import { geti18nString } from '../../../utils/i18n'

const useStyles = makeStyles(theme => ({
    modal: {},
    backdrop: {
        backgroundColor: 'transparent',
    },
    root: {
        outline: 'none',
        width: 350,
        backgroundColor: theme.palette.background.paper,
    },
    header: {},
    content: {},
    actions: {},
    title: {},
    button: {},
}))

export interface SelectRecipientsModalUIProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    open: boolean
    submitDisabled: boolean
    onSubmit: () => void
    onClose: () => void
}
export function SelectRecipientsModalUI(props: SelectRecipientsModalUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const rootRef = useRef<HTMLDivElement>(null)

    return (
        <div ref={rootRef}>
            <Modal
                className={classes.modal}
                open={props.open}
                aria-labelledby="modal-title" // TODO
                aria-describedby="modal-description" // TODO
                disablePortal
                disableAutoFocus
                disableEnforceFocus
                container={() => rootRef.current}
                BackdropProps={{
                    className: classes.backdrop,
                }}
                onEscapeKeyDown={props.onClose}
                onBackdropClick={props.onClose}>
                <Card className={classes.root}>
                    <CardHeader
                        className={classes.header}
                        title={
                            <Typography className={classes.title} display="inline" variant="h6">
                                {geti18nString('recipients_modal__title')}
                            </Typography>
                        }></CardHeader>
                    <CardContent className={classes.content}></CardContent>
                    <CardActions className={classes.actions}>
                        <Button
                            className={classes.button}
                            style={{ marginLeft: 'auto' }}
                            color="primary"
                            variant="contained"
                            disabled={props.submitDisabled}
                            onClick={props.onSubmit}>
                            {geti18nString('recipients_modal__button')}
                        </Button>
                    </CardActions>
                </Card>
            </Modal>
        </div>
    )
}

export interface SelectRecipientsModalProps extends Partial<SelectRecipientsModalUIProps> {}
export function SelectRecipientsModal(props: SelectRecipientsModalProps) {
    const [open, setOpen] = useState(props.open ?? false)
    const onSubmit = or(
        props.onSubmit,
        useCallback(() => console.log('submit'), []),
    )
    const onClose = or(
        props.onClose,
        useCallback(() => setOpen(false), []),
    )

    return <SelectRecipientsModalUI open={open} onSubmit={onSubmit} onClose={onClose} submitDisabled={false} />
}
