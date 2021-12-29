import { useState } from 'react'
import { useAsync } from 'react-use'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import { useFriendsList } from '../DataSource/useActivatedUI'
import { Avatar } from '../../utils/components/Avatar'
import type { Profile } from '../../database'
import Services from '../../extension/service'
import { PostIVIdentifier } from '@masknet/shared-base'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import { DialogContent, DialogContentText } from '@mui/material'
import { InjectedDialog } from '../shared/InjectedDialog'

export interface SimpleDialogProps {
    open: boolean
    onClose: () => void
    friends: Profile[]
    hashMap: [string, string, string][]
}

function PostHashDialog(props: SimpleDialogProps) {
    const { open } = props

    const map = new Map<string, [string, string]>()
    for (const [id, magicCode, fingerprint] of props.hashMap) {
        map.set(id, [magicCode, fingerprint])
    }

    return (
        <InjectedDialog onClose={props.onClose} open={open} title="Troubleshoot">
            <DialogContent>
                <DialogContentText>
                    Appear in this list is not related to if you have shared this post to someone or not.
                </DialogContentText>
                <DialogContentText>
                    The "Magic Code" and the Fingerprint should be the same on your friend's Mask and your Mask.
                </DialogContentText>
                <DialogContentText>
                    If Fingerprint is not the same, it means at least one of Mask doesn't get the correct key of the
                    receiver.
                </DialogContentText>
                <DialogContentText>
                    If MagicCode is not the same, it means at least one of Mask calculate the post hash wrong.
                </DialogContentText>
                <List dense>
                    {props.friends.map((one) => {
                        const [magicCode, fingerprint] = map.get(one.identifier.toText()) || ['Unknown', 'Unknown']
                        return (
                            <ListItem key={one.identifier.toText()}>
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
        </InjectedDialog>
    )
}

export function DebugModeUI_PostHashDialog(props: { post: string; network: string }) {
    const [open, setOpen] = useState(false)
    const payload = deconstructPayload(props.post, null)
    const friends = useFriendsList()
    const { value: hashMap = [] } = useAsync(async () => {
        if (!payload.ok) return []
        const ivID = new PostIVIdentifier(props.network, payload.val.iv)
        return Services.Crypto.debugShowAllPossibleHashForPost(ivID, payload.val.version)
    }, [props.post])
    const shouldHide = payload.map((x) => x.version === -38 && !!x.sharedPublic).unwrapOr(true)
    if (shouldHide) return null
    return (
        <>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                My friend can't see this post even I shared with them!
            </Button>
            <PostHashDialog hashMap={hashMap} friends={friends} open={open} onClose={() => setOpen(false)} />
        </>
    )
}
