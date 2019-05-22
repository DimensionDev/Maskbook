import * as React from 'react'
import AppBar from '@material-ui/core/AppBar/AppBar'
import Toolbar from '@material-ui/core/Toolbar/Toolbar'
import Typography from '@material-ui/core/Typography/Typography'
import Button from '@material-ui/core/Button/Button'
import { FullWidth } from '../../utils/components/Flex'
import IconButton from '@material-ui/core/IconButton/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { withStylesTyped } from '../../utils/theme'
import { geti18nString } from '../../utils/i18n'

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
                        {geti18nString('banner-title')}
                    </Typography>
                </FullWidth>
                <Button
                    onClick={props.getStarted}
                    classes={{ root: props.classes.button }}
                    variant="contained"
                    color="primary">
                    {geti18nString('banner-get-started')}
                </Button>
                <IconButton
                    aria-label={geti18nString('banner-dismiss-aria')}
                    onClick={props.close}
                    classes={{ root: props.classes.close }}>
                    <CloseIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
})
