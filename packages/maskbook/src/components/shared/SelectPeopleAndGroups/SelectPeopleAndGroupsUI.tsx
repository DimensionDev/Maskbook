import { useEffect, useState, useCallback } from 'react'
import { makeStyles, ListItem, ListItemText, InputBase, Button, List, Box } from '@material-ui/core'
import { useI18N } from '../../../utils'
import type { Profile, Group } from '../../../database'
import { useCurrentIdentity } from '../../DataSource/useActivatedUI'
import { ProfileOrGroupInList, ProfileOrGroupInListProps } from './PersonOrGroupInList'
import { ProfileOrGroupInChip, ProfileOrGroupInChipProps } from './PersonOrGroupInChip'
import { ProfileIdentifier, GroupIdentifier } from '../../../database/type'
import { useStylesExtends } from '../../custom-ui-helper'

type ProfileOrGroup = Group | Profile
export interface SelectProfileAndGroupsUIProps<ServeType extends Group | Profile = Group | Profile>
    extends withClasses<never | 'root'> {
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
    ProfileOrGroupInChipProps?: Partial<ProfileOrGroupInChipProps>
    ProfileOrGroupInListProps?: Partial<ProfileOrGroupInListProps>
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
export function SelectProfileAndGroupsUI<ServeType extends Group | Profile = ProfileOrGroup>(
    props: SelectProfileAndGroupsUIProps<ServeType>,
) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const myself = useCurrentIdentity()

    const items: ProfileOrGroup[] = props.items
    const selected: ProfileOrGroup[] = props.selected
    const { frozenSelected, onSetSelected, disabled, ignoreMyself } = props
    const { hideSelectAll, hideSelectNone, showAtNetwork, maxSelection } = props

    useEffect(() => {
        if (myself && ignoreMyself) {
            const filtered = selected.find((x) => x.identifier.equals(myself.identifier))
            if (filtered) onSetSelected(selected.filter((x) => x !== filtered) as ServeType[])
        }
    }, [ignoreMyself, myself, onSetSelected, selected])

    const [search, setSearch] = useState('')
    const listBeforeSearch = items.filter((x) => {
        if (ignoreMyself && myself && x.identifier.equals(myself.identifier)) return false
        if (selected.find((y) => x.identifier.equals(y.identifier))) return false
        return true
    })
    const listAfterSearch = listBeforeSearch.filter((x) => {
        if (frozenSelected && frozenSelected.find((y) => x.identifier.equals(y.identifier))) return false
        if (search === '') return true
        if (isPerson(x)) {
            return (
                !!x.identifier.userId.toLowerCase().match(search.toLowerCase()) ||
                !!x.linkedPersona?.fingerprint.toLowerCase().match(search.toLowerCase()) ||
                !!(x.nickname || '').toLowerCase().match(search.toLowerCase())
            )
        } else {
            return x.groupName.toLowerCase().match(search.toLowerCase())
        }
    })
    const SelectAllButton = (
        <Button
            className={classes.buttons}
            onClick={() => onSetSelected([...selected, ...listAfterSearch] as ServeType[])}>
            {t('select_all')}
        </Button>
    )
    const SelectNoneButton = (
        <Button className={classes.buttons} onClick={() => onSetSelected([])}>
            {t('select_none')}
        </Button>
    )
    const showSelectAll = !hideSelectAll && listAfterSearch.length > 0 && typeof maxSelection === 'undefined'
    const showSelectNone = !hideSelectNone && selected.length > 0
    return (
        <div className={classes.root}>
            <Box
                className={classes.selectedArea}
                sx={{
                    display: 'flex',
                }}>
                {frozenSelected.map((x) => FrozenChip(x, props.ProfileOrGroupInChipProps))}
                {selected
                    .filter((item) => !frozenSelected.includes(item as ServeType))
                    .map((item) => (
                        <ProfileOrGroupInChip
                            disabled={disabled}
                            key={item.identifier.toText()}
                            item={item}
                            onDelete={() =>
                                onSetSelected(
                                    selected.filter((x) => !x.identifier.equals(item.identifier)) as ServeType[],
                                )
                            }
                            {...props.ProfileOrGroupInChipProps}
                        />
                    ))}
                <InputBase
                    className={classes.input}
                    value={disabled ? '' : search}
                    onChange={useCallback((e) => setSearch(e.target.value), [])}
                    onKeyDown={(e) => {
                        if (search === '' && e.key === 'Backspace') {
                            onSetSelected(selected.slice(0, selected.length - 1) as ServeType[])
                        }
                    }}
                    placeholder={disabled ? '' : t('search_box_placeholder')}
                    disabled={disabled}
                />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                }}>
                {showSelectAll && SelectAllButton}
                {showSelectNone && SelectNoneButton}
            </Box>
            <Box
                sx={{
                    flex: 1,
                }}>
                <List dense>
                    {listBeforeSearch.length > 0 && listAfterSearch.length === 0 && search && (
                        <ListItem>
                            <ListItemText primary={t('no_search_result')} />
                        </ListItem>
                    )}
                    {listAfterSearch.map(PeopleListItem)}
                </List>
            </Box>
        </div>
    )
    function PeopleListItem(item: ProfileOrGroup) {
        if (ignoreMyself && myself && item.identifier.equals(myself.identifier)) return null
        return (
            <ProfileOrGroupInList
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
                {...props.ProfileOrGroupInListProps}
            />
        )
    }
}
SelectProfileAndGroupsUI.defaultProps = {
    frozenSelected: [],
}
function FrozenChip(item: ProfileOrGroup, additionalProps?: Partial<ProfileOrGroupInChipProps>) {
    return <ProfileOrGroupInChip disabled key={item.identifier.toText()} item={item} {...additionalProps} />
}

export function isPerson(x: ProfileOrGroup): x is Profile {
    return x.identifier instanceof ProfileIdentifier
}
export function isGroup(x: ProfileOrGroup): x is Group {
    return x.identifier instanceof GroupIdentifier
}
