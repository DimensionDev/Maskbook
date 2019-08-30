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
    Theme,
} from '@material-ui/core'
import { Person } from '../../database'
import { useState, useCallback } from 'react'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'

interface PeopleInListProps {
    person: Person
    onClick(): void
    disabled?: boolean
    showAtNetwork?: boolean
    listItemProps?: Partial<(typeof ListItem extends OverridableComponent<infer U> ? U : never)['props']>
}
const usePeopleInListStyle = makeStyles<Theme>(theme => ({
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    networkHint: {
        color: theme.palette.grey[500],
    },
}))
/**
 * Item in the list
 */
export function PersonInList({ person, onClick, disabled, showAtNetwork, listItemProps }: PeopleInListProps) {
    const classes = usePeopleInListStyle()
    const name = person.nickname || person.identifier.userId
    const withNetwork = (
        <>
            {name}
            <span className={classes.networkHint}> @ {person.identifier.network}</span>
        </>
    )
    return (
        <ListItem button disabled={disabled} onClick={onClick} {...(listItemProps || {})}>
            <ListItemAvatar>
                <Avatar person={person} />
            </ListItemAvatar>
            <ListItemText
                classes={{ primary: classes.overflow, secondary: classes.overflow }}
                primary={showAtNetwork ? withNetwork : name}
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
interface SelectPeopleUIProps {
    ignoreMyself?: boolean
    people: Person[]
    selected: Person[]
    frozenSelected: Person[]
    onSetSelected: (selected: Person[]) => void
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    showAtNetwork?: boolean
    maxSelection?: number
    classes?: Partial<Record<'root', string>>
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
export function SelectPeopleUI(props: SelectPeopleUIProps) {
    const { people, frozenSelected, onSetSelected, selected, disabled, ignoreMyself } = props
    const { hideSelectAll, hideSelectNone, showAtNetwork, maxSelection, classes: classesProp = {} } = props
    const classes = useStyles()

    const myself = useCurrentIdentity()
    React.useEffect(() => {
        if (myself && ignoreMyself) {
            const filtered = selected.find(x => x.identifier.equals(myself.identifier))
            if (filtered) onSetSelected(selected.filter(x => x !== filtered))
        }
    }, [ignoreMyself, myself, onSetSelected, selected])
    const [search, setSearch] = useState('')
    const listBeforeSearch = people.filter(x => {
        if (ignoreMyself && myself && x.identifier.equals(myself.identifier)) return false
        if (selected.find(y => x.identifier.equals(y.identifier))) return false
        return true
    })
    const listAfterSearch = listBeforeSearch.filter(x => {
        if (frozenSelected && frozenSelected.find(y => x.identifier.userId === y.identifier.userId)) return false
        if (search === '') return true
        return (
            !!x.identifier.userId.toLocaleLowerCase().match(search.toLocaleLowerCase()) ||
            !!(x.fingerprint || '').toLocaleLowerCase().match(search.toLocaleLowerCase()) ||
            !!(x.nickname || '').toLocaleLowerCase().match(search.toLocaleLowerCase())
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

    const showSelectAll = !hideSelectAll && listAfterSearch.length > 0 && typeof maxSelection === 'undefined'
    const showSelectNone = !hideSelectNone && selected.length > 0

    return (
        <div className={classesProp.root}>
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
            <Box display="flex">
                {showSelectAll && SelectAllButton}
                {showSelectNone && SelectNoneButton}
            </Box>
            <Box flex={1}>
                <List dense>
                    {listBeforeSearch.length > 0 && listAfterSearch.length === 0 && search && (
                        <ListItem>
                            <ListItemText primary={geti18nString('no_search_result')} />
                        </ListItem>
                    )}
                    {listAfterSearch.map(PeopleListItem)}
                </List>
            </Box>
        </div>
    )

    function PeopleListItem(person: Person) {
        if (ignoreMyself && myself && person.identifier.equals(myself.identifier)) return null
        return (
            <PersonInList
                showAtNetwork={showAtNetwork}
                key={person.identifier.userId}
                person={person}
                disabled={
                    disabled ||
                    (typeof maxSelection === 'number' &&
                        maxSelection >= 2 &&
                        frozenSelected.length + selected.length >= maxSelection)
                }
                onClick={() => {
                    if (maxSelection === 1) onSetSelected([person])
                    else onSetSelected(selected.concat(person))
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
