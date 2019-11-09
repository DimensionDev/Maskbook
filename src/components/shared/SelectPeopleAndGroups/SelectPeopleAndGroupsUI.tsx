import React, { useState, useCallback } from 'react'
import { geti18nString } from '../../../utils/i18n'
import { makeStyles, ListItem, ListItemText, InputBase, Button, List, Box } from '@material-ui/core'
import { Person, Group } from '../../../database'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { PersonOrGroupInList, PersonOrGroupInListProps } from './PersonOrGroupInList'
import { PersonOrGroupInChip, PersonOrGroupInChipProps } from './PersonOrGroupInChip'
import { PersonIdentifier, GroupIdentifier } from '../../../database/type'
import { useStylesExtends } from '../../custom-ui-helper'
type PersonOrGroup = Group | Person
export interface SelectPeopleAndGroupsUIProps<ServeType extends Group | Person = Group | Person>
    extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'root'> {
    /** Omit myself in the UI and the selected result */
    ignoreMyself?: boolean
    items: ServeType[]
    selected: ServeType[]
    frozenSelected: ServeType[]
    onSetSelected(selected: ServeType[]): void
    disabled?: boolean
    hideSelectAll?: boolean
    hideSelectNone?: boolean
    showAtNetwork?: boolean
    maxSelection?: number
    PersonOrGroupInChipProps?: Partial<PersonOrGroupInChipProps>
    PersonOrGroupInListProps?: Partial<PersonOrGroupInListProps>
}
const useStyles = makeStyles({
    selectedArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        display: 'flex',
        padding: '12px 6px 6px 12px',
    },
    input: { flex: 1, minWidth: '10em' },
    buttons: { marginLeft: 8, padding: '2px 6px' },
})
export function SelectPeopleAndGroupsUI<ServeType extends Group | Person = PersonOrGroup>(
    props: SelectPeopleAndGroupsUIProps<ServeType>,
) {
    const classes = useStylesExtends(useStyles(), props)
    const myself = useCurrentIdentity()

    const items: PersonOrGroup[] = props.items
    const selected: PersonOrGroup[] = props.selected
    const { frozenSelected, onSetSelected, disabled, ignoreMyself } = props
    const { hideSelectAll, hideSelectNone, showAtNetwork, maxSelection } = props

    React.useEffect(() => {
        if (myself && ignoreMyself) {
            const filtered = selected.find(x => x.identifier.equals(myself.identifier))
            if (filtered) onSetSelected(selected.filter(x => x !== filtered) as ServeType[])
        }
    }, [ignoreMyself, myself, onSetSelected, selected])

    const [search, setSearch] = useState('')
    const listBeforeSearch = items.filter(x => {
        if (ignoreMyself && myself && x.identifier.equals(myself.identifier)) return false
        if (selected.find(y => x.identifier.equals(y.identifier))) return false
        return true
    })
    const listAfterSearch = listBeforeSearch.filter(x => {
        if (frozenSelected && frozenSelected.find(y => x.identifier.equals(y.identifier))) return false
        if (search === '') return true
        if (isPerson(x)) {
            return (
                !!x.identifier.userId.toLowerCase().match(search.toLowerCase()) ||
                !!(x.fingerprint || '').toLowerCase().match(search.toLowerCase()) ||
                !!(x.nickname || '').toLowerCase().match(search.toLowerCase())
            )
        } else {
            return x.groupName.toLowerCase().match(search.toLowerCase())
        }
    })
    const SelectAllButton = (
        <Button
            className={classes.buttons}
            color="primary"
            onClick={() => onSetSelected([...selected, ...listAfterSearch] as ServeType[])}>
            {geti18nString('select_all')}
        </Button>
    )
    const SelectNoneButton = (
        <Button className={classes.buttons} onClick={() => onSetSelected([])}>
            {geti18nString('select_none')}
        </Button>
    )
    const showSelectAll = !hideSelectAll && listAfterSearch.length > 0 && typeof maxSelection === 'undefined'
    const showSelectNone = !hideSelectNone && selected.length > 0
    return (
        <div className={classes.root}>
            <Box display="flex" className={classes.selectedArea}>
                {frozenSelected.map(x => FrozenChip(x, props.PersonOrGroupInChipProps))}
                {selected
                    .filter(item => !frozenSelected.includes(item as ServeType))
                    .map(item => (
                        <PersonOrGroupInChip
                            disabled={disabled}
                            key={item.identifier.toText()}
                            item={item}
                            onDelete={() =>
                                onSetSelected(
                                    selected.filter(x => !x.identifier.equals(item.identifier)) as ServeType[],
                                )
                            }
                            {...props.PersonOrGroupInChipProps}
                        />
                    ))}
                <InputBase
                    className={classes.input}
                    value={disabled ? '' : search}
                    onChange={useCallback(e => setSearch(e.target.value), [])}
                    onKeyDown={e => {
                        if (search === '' && e.key === 'Backspace') {
                            onSetSelected(selected.slice(0, selected.length - 1) as ServeType[])
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
    function PeopleListItem(item: PersonOrGroup) {
        if (ignoreMyself && myself && item.identifier.equals(myself.identifier)) return null
        return (
            <PersonOrGroupInList
                showAtNetwork={showAtNetwork}
                key={item.identifier.toText()}
                item={item}
                disabled={
                    disabled ||
                    (typeof maxSelection === 'number' &&
                        maxSelection >= 2 &&
                        frozenSelected.length + selected.length >= maxSelection)
                }
                onClick={() => {
                    if (maxSelection === 1) onSetSelected([item as ServeType])
                    else onSetSelected(selected.concat(item) as ServeType[])
                    setSearch('')
                }}
                {...props.PersonOrGroupInListProps}
            />
        )
    }
}
SelectPeopleAndGroupsUI.defaultProps = {
    frozenSelected: [],
}
function FrozenChip(item: PersonOrGroup, additionalProps?: Partial<PersonOrGroupInChipProps>) {
    return <PersonOrGroupInChip disabled key={item.identifier.toText()} item={item} {...additionalProps} />
}

export function isPerson(x: PersonOrGroup): x is Person {
    return x.identifier instanceof PersonIdentifier
}
export function isGroup(x: PersonOrGroup): x is Group {
    return x.identifier instanceof GroupIdentifier
}
