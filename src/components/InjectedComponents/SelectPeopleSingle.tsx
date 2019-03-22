import * as React from 'react'
import { FullWidth } from '../../utils/Flex'
import Avatar from '@material-ui/core/Avatar/Avatar'
import Paper from '@material-ui/core/Paper/Paper'
import List from '@material-ui/core/List/List'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar/ListItemAvatar'
import { Person } from '../../extension/background-script/PeopleService'

interface Props {
    all: Person[]
    selected?: Person
    onSelect(person: Person): void
}
export function PeopleInList(props: { people: Person; onClick(): void; selected?: boolean }) {
    const name = props.people.username.split(' ')
    const avatar = props.people.avatar ? (
        <Avatar src={props.people.avatar} />
    ) : (
        <Avatar>
            {name[0][0]}
            {(name[1] || '')[0]}
        </Avatar>
    )
    return (
        <ListItem selected={props.selected} button onClick={props.onClick}>
            <ListItemAvatar>{avatar}</ListItemAvatar>
            <ListItemText primary={props.people.username} secondary={(props.people.fingerprint || '?').toLowerCase()} />
        </ListItem>
    )
}
export function SelectPeopleSingle(props: Props) {
    return (
        <Paper style={{ maxWidth: 500 }}>
            <FullWidth>
                <List dense>
                    {props.all.length === 0 && (
                        <ListItem>
                            <ListItemText primary="You have no friends!" secondary="Add them, get some help." />
                        </ListItem>
                    )}
                    {props.all.map(p => (
                        <PeopleInList
                            selected={p.username === (props.selected || { username: '' }).username}
                            key={p.fingerprint}
                            onClick={() => props.onSelect(p)}
                            people={p}
                        />
                    ))}
                </List>
            </FullWidth>
        </Paper>
    )
}
