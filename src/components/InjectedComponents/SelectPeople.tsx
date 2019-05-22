import * as React from 'react'
import { FlexBox, FullWidth } from '../../utils/components/Flex'
import Chip from '@material-ui/core/Chip/Chip'
import InputBase from '@material-ui/core/InputBase/InputBase'
import List from '@material-ui/core/List/List'
import { Person } from '../../extension/background-script/PeopleService'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import Button from '@material-ui/core/Button/Button'
import { withStylesTyped } from '../../utils/theme'
import ListItemAvatar from '@material-ui/core/ListItemAvatar/ListItemAvatar'
import { Avatar } from '../../utils/components/Avatar'
import { geti18nString } from '../../utils/i18n'

interface PeopleInListProps {
    person: Person
    onClick(): void
    disabled?: boolean
}
/**
 * Item in the list
 */
function PersonInList({ person, onClick, disabled }: PeopleInListProps) {
    return (
        <ListItem button onClick={disabled ? void 0 : onClick}>
            <ListItemAvatar>
                <Avatar person={person} />
            </ListItemAvatar>
            <ListItemText
                primary={person.nickname || person.username}
                secondary={person.fingerprint ? person.fingerprint.toLowerCase() : undefined}
            />
        </ListItem>
    )
}
interface PersonInChipProps {
    person: Person
    onDelete?(): void
    disabled?: boolean
}
function PersonInChip({ disabled, onDelete, person }: PersonInChipProps) {
    const avatar = person.avatar ? <Avatar person={person} /> : undefined
    return (
        <Chip
            style={{ marginRight: 6, marginBottom: 6 }}
            color="primary"
            onDelete={disabled ? undefined : onDelete}
            label={person.nickname || person.username}
            avatar={avatar}
        />
    )
}
interface SelectPeopleUI {
    people: Person[]
    selected: Person[]
    frozenSelected?: Person[]
    onSetSelected: (selected: Person[]) => void
    disabled?: boolean
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
})<SelectPeopleUI>(function({ people, frozenSelected, classes, onSetSelected, selected, disabled }) {
    const [search, setSearch] = React.useState('')
    const listBeforeSearch = people.filter(x => {
        if (selected.find(y => y.username === x.username)) return false
        return true
    })
    const listAfterSearch = listBeforeSearch.filter(x => {
        if (frozenSelected && frozenSelected.find(y => x.username === y.username)) return false
        if (search === '') return true
        return (
            !!x.username.toLocaleLowerCase().match(search.toLocaleLowerCase()) ||
            !!(x.fingerprint || '').toLocaleLowerCase().match(search.toLocaleLowerCase())
        )
    })
    return (
        <>
            <FlexBox className={classes.selectedArea}>
                {frozenSelected && frozenSelected.map(p => <PersonInChip disabled key={p.username} person={p} />)}
                {selected.map(p => (
                    <PersonInChip
                        disabled={disabled}
                        key={p.username}
                        person={p}
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
                    placeholder={disabled ? '' : geti18nString('search-box-placeholder')}
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
                            {geti18nString('select-all')}
                        </Button>
                    )}
                    {selected.length > 0 && (
                        <Button className={classes.button} onClick={() => onSetSelected([])}>
                            {geti18nString('select-none')}
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
                                <ListItemText primary={geti18nString('not-found')} />
                            </ListItem>
                        )}
                        {listAfterSearch.map(p => (
                            <PersonInList
                                key={p.username}
                                person={p}
                                disabled={disabled}
                                onClick={() => {
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
})
