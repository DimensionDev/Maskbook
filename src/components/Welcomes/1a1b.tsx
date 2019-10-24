import * as React from 'react'
import { geti18nString } from '../../utils/i18n'
import { Typography, Button, makeStyles, Theme } from '@material-ui/core'
import WelcomeContainer from './WelcomeContainer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import { definedSocialNetworkUIs, SocialNetworkUI } from '../../social-network/ui'
import { env } from '../../social-network/shared'

interface Props {
    useExistingAccounts(): void
}
const useStyles = makeStyles<Theme>(theme => ({
    paper: {
        textAlign: 'center',
        minWidth: 250,
    },
    button: {
        minWidth: 180,
    },
    list: {
        width: '100%',
        margin: 'auto',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}))
export default function Welcome({ useExistingAccounts }: Props) {
    const classes = useStyles()
    const providers = Array.from(definedSocialNetworkUIs)

    const normal = (provider: SocialNetworkUI) => {
        const setup = provider.setupAccount
        const secondary = typeof setup === 'function' ? undefined : setup
        const secondaryWithDangerous = provider.isDangerousNetwork ? (
            <>
                <Typography color="error">{geti18nString('welcome_1a1b_danger')}</Typography>
                {secondary}
            </>
        ) : (
            secondary
        )
        const button =
            typeof setup === 'function' ? (
                <ListItemSecondaryAction>
                    <Button onClick={() => setup(env, {})} color="primary">
                        {geti18nString('welcome_1a1b_connect')}
                    </Button>
                </ListItemSecondaryAction>
            ) : null
        return (
            <ListItem key={provider.friendlyName}>
                <ListItemText primary={provider.friendlyName} secondary={secondaryWithDangerous} />
                {button}
            </ListItem>
        )
    }
    return (
        <WelcomeContainer className={classes.paper}>
            <List
                subheader={<ListSubheader>{geti18nString('welcome_1a1b_title')}</ListSubheader>}
                className={classes.list}>
                {providers.map(normal)}
            </List>
            <br />
            <Button color="primary" onClick={useExistingAccounts}>
                {geti18nString('welcome_1a1b_switch')}
            </Button>
        </WelcomeContainer>
    )
}
