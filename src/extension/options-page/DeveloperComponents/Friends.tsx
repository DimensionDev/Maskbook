import { SelectPeopleAndGroupsUI } from '../../../components/shared/SelectPeopleAndGroups'
import { useFriendsList } from '../../../components/DataSource/useActivatedUI'
import {
    Card,
    CardContent,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    ListItemAvatar,
    ListItemText,
    makeStyles,
} from '@material-ui/core'
import React, { useState } from 'react'
import { Person } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import { useTextField } from '../../../utils/components/useForms'
import Services from '../../service'

export function FriendsDeveloperMode() {
    const friends = useFriendsList()
    const [editing, setEditing] = useState<Person>()
    const closeDialog = () => setEditing(undefined)
    return (
        <>
            <Dialog open={!!editing} onClose={closeDialog} aria-labelledby="edit-person">
                {editing ? <PersonEditDialog person={editing} onClose={closeDialog} /> : <></>}
            </Dialog>
            <Card>
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                        All people recorded in the Maskbook database, touch to edit person from database.
                    </Typography>

                    <SelectPeopleAndGroupsUI<Person>
                        hideSelectAll
                        hideSelectNone
                        items={friends}
                        maxSelection={0}
                        showAtNetwork
                        selected={[]}
                        onSetSelected={people => setEditing(people[0])}
                    />
                </CardContent>
            </Card>
        </>
    )
}

const useStyles = makeStyles({
    title: { '& > *': { display: 'flex' } },
})
function PersonEditDialog(props: { person: Person; onClose(): void }) {
    const classes = useStyles()
    const { onClose, person } = props
    const [, identifier] = useTextField('Internal ID', {
        disabled: true,
        defaultValue: person.identifier.friendlyToText(),
        margin: 'dense',
    })
    const [nickname, nicknameInput] = useTextField('Nickname', {
        autoFocus: true,
        margin: 'dense',
        defaultValue: person.nickname,
    })
    const [avatar, avatarInput] = useTextField('New avatar URL', {
        type: 'url',
        margin: 'dense',
    })
    const [, fingerprint] = useTextField('Fingerprint', {
        disabled: true,
        defaultValue: person.fingerprint,
        margin: 'dense',
    })
    return (
        <>
            <DialogTitle id="edit-person" classes={{ root: classes.title }}>
                <ListItemAvatar>
                    <Avatar person={person}></Avatar>
                </ListItemAvatar>
                <ListItemText primary={person.nickname || person.identifier.friendlyToText()} />
            </DialogTitle>
            <DialogContent>
                {identifier}
                {nicknameInput}
                {avatarInput}
                {fingerprint}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    Close
                </Button>
                <Button
                    onClick={() => {
                        Services.People.removePeople([person.identifier])
                        onClose()
                    }}
                    color="secondary"
                    variant="outlined">
                    Delete
                </Button>
                <Button
                    onClick={() => {
                        Services.People.updatePersonInfo(person.identifier, {
                            nickname,
                            avatarURL: avatar,
                            forceUpdateAvatar: true,
                        })
                        onClose()
                    }}
                    color="primary"
                    variant="contained">
                    Save
                </Button>
            </DialogActions>
        </>
    )
}
