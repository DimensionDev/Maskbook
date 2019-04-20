import * as React from 'react'
import { FlexBox, FullWidth } from '../../utils/Flex'
import Chip from '@material-ui/core/Chip/Chip'
import Avatar from '@material-ui/core/Avatar/Avatar'
import Paper from '@material-ui/core/Paper/Paper'
import InputBase from '@material-ui/core/InputBase/InputBase'
import List from '@material-ui/core/List/List'
import { Person } from '../../extension/background-script/PeopleService'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import Button from '@material-ui/core/Button/Button'
import { withStylesTyped } from '../../utils/theme'
import ListItemAvatar from '@material-ui/core/ListItemAvatar/ListItemAvatar'

function PeopleInList(props: { people: Person; onClick(): void; selected?: boolean }) {
    const name = (props.people.nickname || props.people.username).split(' ')
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
            <ListItemText
                primary={props.people.nickname || props.people.username}
                secondary={(props.people.fingerprint || '?').toLowerCase()}
            />
        </ListItem>
    )
}
interface Props {
    all: Person[]
    selected: Person[]
    onSetSelected: (n: Person[]) => void
    borderless?: boolean
    disabled?: boolean
}
function PeopleChip(props: { onDelete(): void; people: Person; disabled?: boolean }) {
    const avatar = props.people.avatar ? <Avatar src={props.people.avatar} /> : undefined
    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={props.disabled ? undefined : props.onDelete}
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
})<Props>(function SelectPeopleUI({ all, classes, onSetSelected, selected, borderless, disabled }) {
    const [search, setSearch] = React.useState('')
    const listBeforeSearch = all.filter(x => {
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
    const ui = (
        <>
            <FlexBox className={classes.selectedArea}>
                {selected.map(p => (
                    <PeopleChip
                        disabled={disabled}
                        key={p.username}
                        people={p}
                        onDelete={() => onSetSelected(selected.filter(x => x.username !== p.username))}
                    />
                ))}
                <InputBase
                    className={classes.input}
                    value={disabled ? '' : search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => {
                        if (search === '' && e.key === 'Backspace') {
                            onSetSelected(selected.slice(0, selected.length - 1))
                        }
                    }}
                    placeholder={disabled ? '' : 'Type here to search'}
                    disabled={disabled}
                />
            </FlexBox>
            {disabled ? (
                undefined
            ) : (
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
            )}

            {disabled ? (
                undefined
            ) : (
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
                                    if (disabled) return
                                    onSetSelected(selected.concat(p))
                                    setSearch('')
                                }}
                            />
                        ))}
                    </List>
                </FullWidth>
            )}
        </>
    )
    if (borderless) return ui
    else return <Paper className={classes.paper}>{ui}</Paper>
})
