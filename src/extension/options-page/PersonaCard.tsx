import React, { useState, useMemo } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { Person } from '../../database'
import { Divider } from '@material-ui/core'
import Services from '../service'
import { definedSocialNetworkUIs, SocialNetworkUI } from '../../social-network/ui'

interface Props {
    identity: Person
}

const useStyles = makeStyles(theme =>
    createStyles({
        card: {
            minWidth: 375,
            margin: 20,
        },
        header: {
            display: 'flex',
            alignItems: 'flex-end',
            '& > .title': {
                marginRight: theme.spacing(1),
            },
            '& > .extra-item': {
                visibility: 'hidden',
            },
            '&:hover': {
                '& > .extra-item': {
                    visibility: 'visible',
                },
            },
        },
        line: {
            display: 'flex',
            '&:not(:first-child)': {
                paddingTop: theme.spacing(1),
            },
            '& > div': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexShrink: 1,
                whiteSpace: 'nowrap',
            },
            '& > .content': {
                margin: '0 1em',
            },
            '& > .title': {
                flexShrink: 0,
                width: '5rem',
            },
            '& > .extra-item': {
                visibility: 'hidden',
                marginRight: '0',
                flexShrink: 0,
                marginLeft: 'auto',
            },
            '&:hover': {
                '& > .extra-item': {
                    visibility: 'visible',
                },
            },
        },
    }),
)

export default function PersonaCard({ identity }: Props) {
    const classes = useStyles()

    const [provePost, setProvePost] = useState<string>('')

    useMemo(() => {
        Services.Crypto.getMyProveBio(identity.identifier).then(p => setProvePost(p || ''))
    }, [identity])

    const [friendlyName, setFriendlyName] = useState<string>('')

    useMemo(() => {
        const ui = [...definedSocialNetworkUIs].find(i => i.networkIdentifier === identity.identifier.network)
        setFriendlyName(ui ? ui.friendlyName : `Unknown(${identity.identifier.network})`)
    }, [identity])

    return (
        <Card className={classes.card} raised elevation={3}>
            <CardContent>
                <Typography className={classes.header} variant="h5" component="h2" gutterBottom>
                    <span className="title">{identity.nickname || identity.identifier.userId}</span>
                    <Typography className="extra-item" variant="body1" component="span" color="textSecondary">
                        [Edit Name]
                    </Typography>
                </Typography>
                <Typography className={classes.line} component="div">
                    <div className="title" title={friendlyName}>
                        {friendlyName}
                    </div>
                    <div className="content" title={identity.identifier.userId}>
                        {identity.identifier.userId}
                    </div>
                    <div className="extra-item">Disconnect</div>
                </Typography>
            </CardContent>
            <Divider />
            <CardContent>
                <Typography className={classes.line} component="div">
                    <div className="title">Public Key</div>
                    <div className="content" title={provePost}>
                        {provePost}
                    </div>
                    <div className="extra-item">Copy</div>
                </Typography>
            </CardContent>
            <Divider />
            <CardActions>
                <Button size="small">Create Backup</Button>
                <Button size="small" style={{ marginLeft: 'auto' }}>
                    Delete Persona
                </Button>
            </CardActions>
        </Card>
    )
}
