import * as React from 'react'
import { FlexBox, FullWidth } from '../../utils/Flex'
import Chip from '@material-ui/core/Chip/Chip'
import Avatar from '@material-ui/core/Avatar/Avatar'
import Paper from '@material-ui/core/Paper/Paper'
import InputBase from '@material-ui/core/InputBase/InputBase'
import List from '@material-ui/core/List/List'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar/ListItemAvatar'

interface People {
    name: string
    fingerprint: string
    avatar?: string
}
interface Props {}
function People(props: { onDelete(): void; people: People }) {
    const avatar = props.people.avatar ? <Avatar src={props.people.avatar} /> : undefined
    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={props.onDelete}
            label={props.people.name}
            avatar={avatar}
        />
    )
}
function PeopleInList(props: { people: People; onClick(): void }) {
    const name = props.people.name.split(' ')
    const avatar = props.people.avatar ? (
        <Avatar src={props.people.avatar} />
    ) : (
        <Avatar>
            {name[0][0]}
            {(name[1] || '')[0]}
        </Avatar>
    )
    return (
        <ListItem button onClick={props.onClick}>
            <ListItemAvatar>{avatar}</ListItemAvatar>
            <ListItemText primary={props.people.name} secondary={props.people.fingerprint.toLowerCase()} />
        </ListItem>
    )
}
const demoPeople: Record<string, People> = {
    jack: {
        name: 'People A',
        fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521',
    },
    alex: {
        name: 'People B',
        fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521'
            .split('')
            .reverse()
            .join(''),
    },
    lee: {
        name: 'People C',
        fingerprint: 'a2f7643cd1aed446ad88f3c8ba13843dfa2f321d',
    },
}
export function SelectPeople(props: Props) {
    return (
        <Paper style={{ maxWidth: 500 }}>
            <FlexBox
                style={
                    {
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        display: 'flex',
                        padding: '12px 6px 6px 12px',
                    } as React.CSSProperties
                }>
                <People onDelete={() => {}} people={demoPeople.jack} />
                <People onDelete={() => {}} people={demoPeople.alex} />
                <People onDelete={() => {}} people={demoPeople.lee} />
                <InputBase style={{ flex: 1 }} />
            </FlexBox>
            <FullWidth>
                <List dense>
                    <PeopleInList onClick={() => {}} people={demoPeople.jack} />
                    <PeopleInList onClick={() => {}} people={demoPeople.lee} />
                    <PeopleInList onClick={() => {}} people={demoPeople.alex} />
                </List>
            </FullWidth>
        </Paper>
    )
}
