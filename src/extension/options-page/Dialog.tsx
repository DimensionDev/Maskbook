import React from 'react'
import { useHistory } from 'react-router'
import { Dialog, Toolbar, IconButton, Slide, Container } from '@material-ui/core'
import { TransitionProps } from '@material-ui/core/transitions'
import CloseIcon from '@material-ui/icons/Close'

export default function FullScreenDialog(props: any) {
    const { children } = props
    const history = useHistory()

    const [open, setOpen] = React.useState(true)

    const handleClose = () => {
        setOpen(false)
        history.replace('/')
    }

    const handleExited = () => {
        // FIXME: never fired
        history.replace('/')
    }

    const Transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
        return <Slide enter exit direction="up" ref={ref} onExited={handleExited} {...props} />
    })

    return (
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
            <Toolbar>
                <IconButton style={{ marginLeft: 'auto' }} color="inherit" onClick={handleClose} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </Toolbar>
            <Container maxWidth="md">{children}</Container>
        </Dialog>
    )
}
