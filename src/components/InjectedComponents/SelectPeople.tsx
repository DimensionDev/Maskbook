import * as React from 'react'
import { Avatar } from '../../utils/components/Avatar'
import { geti18nString } from '../../utils/i18n'
import {
    makeStyles,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    InputBase,
    Button,
    List,
    Box,
} from '@material-ui/core'
import { Person } from '../../database'
import { useState, useContext, useCallback } from 'react'
import { MyIdentitiesContext } from '../DataSource/useActivatedUI'

interface PeopleInListProps {
    person: Person
    onClick(): void
    disabled?: boolean
}
const usePeopleInListStyle = makeStyles({
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
})
/**
 * Item in the list
 */
function PersonInList({ person, onClick, disabled }: PeopleInListProps) {
    const classes = usePeopleInListStyle()
    return (
        <ListItem button onClick={disabled ? void 0 : onClick}>
            <ListItemAvatar>
                <Avatar person={person} />
            </ListItemAvatar>
            <ListItemText
                classes={{ primary: classes.overflow, secondary: classes.overflow }}
                primary={person.nickname || person.identifier.userId}
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
            label={person.nickname || person.identifier.userId}
            avatar={avatar}
        />
    )
}
interface SelectPeopleUI {
    ignoreMyself?: boolean
    people: Person[]
    selected: Person[]
    frozenSelected: Person[]
    onSetSelected: (selected: Person[]) => void
    disabled?: boolean
}
const useStyles = makeStyles({
    paper: { maxWidth: 500 },
    selectedArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        display: 'flex',
        padding: '12px 6px 6px 12px',
    },
    input: { flex: 1 },
    button: { marginLeft: 8, padding: '2px 6px' },
})
export function SelectPeopleUI(props: SelectPeopleUI) {
    const { people, frozenSelected, onSetSelected, selected, disabled, ignoreMyself } = props
    const classes = useStyles()

    const myself = useContext(MyIdentitiesContext)
    const [search, setSearch] = useState('')
    const listBeforeSearch = people.filter(x => {
        if (selected.find(y => y.identifier.userId === x.identifier.userId)) return false
        return true
    })
    const listAfterSearch = listBeforeSearch.filter(x => {
        if (frozenSelected && frozenSelected.find(y => x.identifier.userId === y.identifier.userId)) return false
        if (search === '') return true
        return (
            !!x.identifier.userId.toLocaleLowerCase().match(search.toLocaleLowerCase()) ||
            !!(x.fingerprint || '').toLocaleLowerCase().match(search.toLocaleLowerCase())
        )
    })
    const SelectAllButton = (
        <Button
            className={classes.button}
            color="primary"
            onClick={() => onSetSelected([...selected, ...listAfterSearch])}>
            {geti18nString('select_all')}
        </Button>
    )
    const SelectNoneButton = (
        <Button className={classes.button} onClick={() => onSetSelected([])}>
            {geti18nString('select_none')}
        </Button>
    )
    return (
        <>
            <Box display="flex" className={classes.selectedArea}>
                {frozenSelected.map(FrozenChip)}
                {selected.map(RemovableChip)}
                <InputBase
                    className={classes.input}
                    value={disabled ? '' : search}
                    onChange={useCallback(e => setSearch(e.target.value), [])}
                    onKeyDown={e => {
                        if (search === '' && e.key === 'Backspace') {
                            onSetSelected(selected.slice(0, selected.length - 1))
                        }
                    }}
                    placeholder={disabled ? '' : geti18nString('search_box_placeholder')}
                    disabled={disabled}
                />
            </Box>
            {disabled ? (
                undefined
            ) : (
                <>
                    <Box display="flex">
                        {listAfterSearch.length > 0 && SelectAllButton}
                        {selected.length > 0 && SelectNoneButton}
                    </Box>
                    <Box flex={1}>
                        <List dense>
                            {listBeforeSearch.length > 0 && listBeforeSearch.length === 0 && (
                                <ListItem>
                                    <ListItemText primary={geti18nString('not_found')} />
                                </ListItem>
                            )}
                            {listAfterSearch.map(PeopleListItem)}
                        </List>
                    </Box>
                </>
            )}
        </>
    )

    function PeopleListItem(person: Person) {
        if (ignoreMyself && myself && person.identifier.equals(myself.identifier)) return null
        return (
            <PersonInList
                key={person.identifier.userId}
                person={person}
                disabled={disabled}
                onClick={() => {
                    onSetSelected(selected.concat(person))
                    setSearch('')
                }}
            />
        )
    }
    function FrozenChip(person: Person) {
        return <PersonInChip disabled key={person.identifier.userId} person={person} />
    }
    function RemovableChip(person: Person) {
        return (
            <PersonInChip
                disabled={disabled}
                key={person.identifier.userId}
                person={person}
                onDelete={() => onSetSelected(selected.filter(x => x.identifier.userId !== person.identifier.userId))}
            />
        )
    }
}
SelectPeopleUI.defaultProps = {
    frozenSelected: [],
}
