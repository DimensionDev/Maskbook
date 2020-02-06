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
import { Profile } from '../../database'
import { useAsync } from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { PostIVIdentifier } from '../../database/type'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import { DialogContentText, DialogContent } from '@material-ui/core'

const useStyles = makeStyles({
    avatar: {
        backgroundColor: blue[100],
        color: blue[600],
    },
})

export interface SimpleDialogProps {
    open: boolean
    onClose: (value: string) => void
    friends: Profile[]
    hashMap: [string, string, string][]
}

function SimpleDialog(props: SimpleDialogProps) {
    const { open } = props

    const map = new Map<string, [string, string]>()
    for (const [id, magicCode, fingerprint] of props.hashMap) {
        map.set(id, [magicCode, fingerprint])
    }

    return (
        <Dialog disableEnforceFocus container={PortalShadowRoot} onClose={props.onClose} open={open}>
            <DialogTitle>Troubleshoot</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Appear in this list is not related to if you have shared this post to someone or not.
                </DialogContentText>
                <DialogContentText>
                    The "Magic Code" and the Fingerprint should be the same on your friend's Maskbook and your Maskbook.
                </DialogContentText>
                <DialogContentText>
                    If Fingerprint is not the same, it means at least one of Maskbook doesn't get the correct key of the
                    receiver.
                </DialogContentText>
                <DialogContentText>
                    If MagicCode is not the same, it means at least one of Maskbook calculate the post hash wrong.
                </DialogContentText>
                <List dense>
                    {props.friends.map(one => {
                        const [magicCode, fingerprint] = map.get(one.identifier.toText()) || ['Unknown', 'Unknown']
                        return (
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar person={one} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={one.nickname || one.identifier.userId}
                                    secondary={
                                        <span>
                                            Magic code: {magicCode || 'Unknown'}
                                            <br />
                                            Their fingerprint: {fingerprint}
                                        </span>
                                    }
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </DialogContent>
        </Dialog>
    )
}

export function DebugModeUI_PostHashDialog(props: { post: string; network: string }) {
    const [open, setOpen] = React.useState(false)
    const payload = deconstructPayload(props.post, null)
    const [hashMap, setHashMap] = useState<[string, string, string][]>([])
    const friends = useFriendsList()
    useAsync(() => {
        if (!payload) return Promise.resolve([])
        const ivID = new PostIVIdentifier(props.network, payload.iv)
        return Services.Crypto.debugShowAllPossibleHashForPost(ivID, payload.version)
    }, [props.post]).then(setHashMap)
    return (
        <>
            <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
                My friend can't see this post even I shared with them!
            </Button>
            <SimpleDialog hashMap={hashMap} friends={friends} open={open} onClose={() => setOpen(false)} />
        </>
    )
}
