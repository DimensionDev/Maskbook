import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import { blue } from '@material-ui/core/colors'
import { PortalShadowRoot } from '../../utils/jss/ShadowRootPortal'
import { useFriendsList } from '../DataSource/useActivatedUI'
import { Avatar } from '../../utils/components/Avatar'
import { Person } from '../../database'
import { useAsync } from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { PostIVIdentifier } from '../../database/type'
import { deconstructPayload } from '../../utils/type-transform/Payload'

const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
})

export interface SimpleDialogProps {
    open: boolean
    onClose: (value: string) => void
    friends: Person[]
    hashMap: [string, string][]
}

function SimpleDialog(props: SimpleDialogProps) {
    const { open } = props

    const map = new Map<string, string>()
    for (const data of props.hashMap) {
        map.set(data[0], data[1])
    }

    return (
        <Dialog container={PortalShadowRoot} onClose={props.onClose} open={open}>
            <DialogTitle>
                Post hash for each of your friends (Appear in this list is not related to if you have shared this post
                to someone or not.)
            </DialogTitle>
            <List>
                {props.friends.map(one => {
                    return (
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar person={one} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={one.nickname || one.identifier.userId}
                                secondary={
                                    <span style={{ fontFamily: 'monospace' }}>
                                        {map.get(one.identifier.toText()) || 'Unknown'}
                                    </span>
                                }
                            />
                        </ListItem>
                    )
                })}
            </List>
        </Dialog>
    )
}

export function DebugModeUI_PostHashDialog(props: { post: string; network: string }) {
    const [open, setOpen] = React.useState(false)
    const payload = deconstructPayload(props.post, null)
    const [hashMap, setHashMap] = useState<[string, string][]>([])
    const friends = useFriendsList()
    useAsync(() => {
        if (!payload) return Promise.resolve([] as typeof hashMap)
        const ivID = new PostIVIdentifier(props.network, payload.iv)
        return Services.Crypto.debugShowAllPossibleHashForPost(ivID, payload.version)
    }, [props.post]).then(setHashMap)
    return (
        <>
            <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
                See what code my friends will see for this post
            </Button>
            <SimpleDialog hashMap={hashMap} friends={friends} open={open} onClose={() => setOpen(false)} />
        </>
    )
}
