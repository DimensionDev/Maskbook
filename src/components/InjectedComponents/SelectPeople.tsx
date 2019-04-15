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
import Button from '@material-ui/core/Button/Button'
import { withStylesTyped } from '../../utils/theme'

interface Props {
    all: Person[]
    selected: Person[]
    onSetSelected: (n: Person[]) => void
}
function PeopleChip(props: { onDelete(): void; people: Person }) {
    const avatar = props.people.avatar ? <Avatar src={props.people.avatar} /> : undefined
    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={props.onDelete}
            label={props.people.nickname || props.people.username}
            avatar={avatar}
        />
    )
}
export const SelectPeopleUI = withStylesTyped({
    paper: { maxWidth: 500 },
    selectedArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        display: 'flex',
        padding: '12px 6px 6px 12px',
    },
    input: { flex: 1 },
    button: { marginLeft: 8, padding: '2px 6px' },
})<Props>(function SelectPeopleUI({ all: allPeople, classes, onSetSelected, selected }) {
    const [search, setSearch] = React.useState('')
    const listBeforeSearch = allPeople.filter(x => {
        if (selected.find(y => y.username === x.username)) return false
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
        <Paper className={classes.paper}>
            <FlexBox className={classes.selectedArea}>
                {selected.map(p => (
                    <PeopleChip
                        key={p.username}
                        people={p}
                        onDelete={() => onSetSelected(selected.filter(x => x.username !== p.username))}
                    />
                ))}
                <InputBase
                    className={classes.input}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => {
                        if (search === '' && e.key === 'Backspace') {
                            onSetSelected(selected.slice(0, selected.length - 1))
                        }
                    }}
                />
            </FlexBox>
            <FlexBox>
                {listAfterSearch.length > 0 && (
                    <Button
                        className={classes.button}
                        color="primary"
                        onClick={() => onSetSelected([...selected, ...listAfterSearch])}>
                        Select All
                    </Button>
                )}
                {selected.length > 0 && (
                    <Button className={classes.button} onClick={() => onSetSelected([])}>
                        Select None
                    </Button>
                )}
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
                                onSetSelected(selected.concat(p))
                                setSearch('')
                            }}
                        />
                    ))}
                </List>
            </FullWidth>
        </Paper>
    )
})
