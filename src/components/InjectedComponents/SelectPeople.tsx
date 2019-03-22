import * as React from 'react'
import { FlexBox, FullWidth } from '../../utils/Flex'
import Chip from '@material-ui/core/Chip/Chip'
import Avatar from '@material-ui/core/Avatar/Avatar'
import Paper from '@material-ui/core/Paper/Paper'
import InputBase from '@material-ui/core/InputBase/InputBase'
import List from '@material-ui/core/List/List'
import { Person } from '../../extension/background-script/PeopleService'
import { PeopleInList } from './SelectPeopleSingle'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import { usePeople } from '../DataSource/PeopleRef'

interface Props {
    all: Person[]
    selected: Person[]
    onSetSelected: (n: Person[]) => void
}
function People(props: { onDelete(): void; people: Person }) {
    const avatar = props.people.avatar ? <Avatar src={props.people.avatar} /> : undefined
    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={props.onDelete}
            label={props.people.username}
            avatar={avatar}
        />
    )
}
export function SelectPeopleUI(props: Props) {
    const [search, setSearch] = React.useState('')
    const listBeforeSearch = props.all.filter(x => {
        if (props.selected.find(y => y.username === x.username)) return false
        return true
    })
    const listAfterSearch = listBeforeSearch.filter(x => {
        if (search === '') return true
        return (
            !!x.username.toLocaleLowerCase().match(search.toLocaleLowerCase()) ||
            !!(x.fingerprint || '').toLocaleLowerCase().match(search.toLocaleLowerCase())
        )
    })
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
                {props.selected.map(p => (
                    <People
                        key={p.username}
                        people={p}
                        onDelete={() => props.onSetSelected(props.selected.filter(x => x.username !== p.username))}
                    />
                ))}
                <InputBase
                    style={{ flex: 1 }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => {
                        if (search === '' && e.key === 'Backspace') {
                            props.onSetSelected(props.selected.slice(0, props.selected.length - 1))
                        }
                    }}
                />
            </FlexBox>
            <FullWidth>
                <List dense>
                    {listBeforeSearch.length > 0 && listBeforeSearch.length === 0 && (
                        <ListItem>
                            <ListItemText primary="Not found" />
                        </ListItem>
                    )}
                    {listAfterSearch.map(p => (
                        <PeopleInList
                            key={p.username}
                            people={p}
                            onClick={() => {
                                props.onSetSelected(props.selected.concat(p))
                                setSearch('')
                            }}
                        />
                    ))}
                </List>
            </FullWidth>
        </Paper>
    )
}
export function SelectPeople() {
    const [selected, select] = React.useState<Person[]>([])
    const people = usePeople()
    return <SelectPeopleUI all={people} selected={selected} onSetSelected={select} />
}
