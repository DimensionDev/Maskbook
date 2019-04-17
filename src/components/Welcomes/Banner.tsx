import * as React from 'react'
import AppBar from '@material-ui/core/AppBar/AppBar'
import Toolbar from '@material-ui/core/Toolbar/Toolbar'
import Typography from '@material-ui/core/Typography/Typography'
import Button from '@material-ui/core/Button/Button'
import { FullWidth } from '../../utils/Flex'
import IconButton from '@material-ui/core/IconButton/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { withStylesTyped } from '../../utils/theme'

interface Props {
    getStarted(): void
    close(): void
}
export const Banner = withStylesTyped({
    root: {
        border: '1px solid #ccc',
        borderRadius: 4,
        marginBottom: 10,
    },
    toolbar: {
        display: 'flex',
        paddingRight: 0,
    },
    button: {
        padding: '4px 3em',
    },
    close: {
        margin: 6,
        padding: 6,
    },
})<Props>(props => {
    return (
        <AppBar position="static" color="default" elevation={0} classes={{ root: props.classes.root }}>
            <Toolbar className={props.classes.toolbar}>
                <FullWidth>
                    <Typography variant="subtitle1" color="inherit">
                        Welcome to Maskbook
                    </Typography>
                </FullWidth>
                <Button
                    onClick={props.getStarted}
                    classes={{ root: props.classes.button }}
                    variant="contained"
                    color="primary">
                    Get started
                </Button>
                <IconButton onClick={props.close} classes={{ root: props.classes.close }} aria-label="Close">
                    <CloseIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
})
