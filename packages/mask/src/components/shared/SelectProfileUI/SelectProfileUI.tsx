import { useState, useCallback } from 'react'
import { ListItem, ListItemText, InputBase, Button, List, Box, Chip } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../../utils'
import type { Profile } from '../../../database'
import { ProfileInList } from './ProfileInList'
import { ProfileInChip } from './ProfileInChip'
import { FixedSizeList } from 'react-window'

export interface SelectProfileUIProps extends withClasses<'root'> {
    items: Profile[]
    selected: Profile[]
    frozenSelected: Profile[]
    onSetSelected(selected: Profile[]): void
    disabled?: boolean
}
const useStyles = makeStyles()({
    selectedArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        display: 'flex',
        padding: '12px 6px 6px 12px',
    },
    input: { flex: 1, minWidth: '10em' },
    buttons: { marginLeft: 8, padding: '2px 6px' },
})
export function SelectProfileUI(props: SelectProfileUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const items: Profile[] = props.items
    const selected: Profile[] = props.selected
    const { frozenSelected, onSetSelected, disabled } = props

    const [search, setSearch] = useState('')
    const listBeforeSearch = items.filter((x) => {
        if (selected.find((y) => x.identifier.equals(y.identifier))) return false
        return true
    })
    const listAfterSearch = listBeforeSearch.filter((x) => {
        if (frozenSelected.find((y) => x.identifier.equals(y.identifier))) return false
        if (search === '') return true
        return (
            !!x.identifier.userId.toLowerCase().match(search.toLowerCase()) ||
            !!x.linkedPersona?.fingerprint.toLowerCase().match(search.toLowerCase()) ||
            !!(x.nickname || '').toLowerCase().match(search.toLowerCase())
        )
    })
    const SelectAllButton = (
        <Button
            className={classes.buttons}
            onClick={() => onSetSelected([...selected, ...listAfterSearch] as Profile[])}>
            {t('select_all')}
        </Button>
    )
    const SelectNoneButton = (
        <Button className={classes.buttons} onClick={() => onSetSelected([])}>
            {t('select_none')}
        </Button>
    )
    const showSelectAll = listAfterSearch.length > 0
    const showSelectNone = selected.length > 0

    return (
        <div className={classes.root}>
            <Box
                className={classes.selectedArea}
                sx={{
                    display: 'flex',
                }}>
                {frozenSelected.length === items.length || !listBeforeSearch.length ? (
                    <Chip
                        disabled={disabled}
                        style={{ marginRight: 6, marginBottom: 6 }}
                        color="primary"
                        onDelete={frozenSelected.length !== items.length ? () => onSetSelected([]) : undefined}
                        label={t('all_friends')}
                    />
                ) : (
                    <>
                        {frozenSelected.map((x) => FrozenChip(x))}
                        {selected
                            .filter((item) => !frozenSelected.includes(item as Profile))
                            .map((item) => (
                                <ProfileInChip
                                    disabled={disabled}
                                    key={item.identifier.toText()}
                                    item={item}
                                    onDelete={() =>
                                        onSetSelected(
                                            selected.filter((x) => !x.identifier.equals(item.identifier)) as Profile[],
                                        )
                                    }
                                />
                            ))}
                    </>
                )}
                <InputBase
                    className={classes.input}
                    value={disabled ? '' : search}
                    onChange={useCallback((e) => setSearch(e.target.value), [])}
                    onKeyDown={(e) => {
                        if (search === '' && e.key === 'Backspace') {
                            onSetSelected(selected.slice(0, selected.length - 1) as Profile[])
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
                    <FixedSizeList
                        itemSize={56}
                        itemCount={listAfterSearch.length}
                        overscanCount={5}
                        width="100%"
                        height={400}>
                        {({ index, style }) =>
                            listAfterSearch[index] ? ProfileListItem(listAfterSearch[index], style as any) : null
                        }
                    </FixedSizeList>
                </List>
            </Box>
        </div>
    )
    function ProfileListItem(item: Profile, style: React.CSSProperties) {
        return (
            <ProfileInList
                key={item.identifier.toText()}
                item={item}
                disabled={disabled}
                onClick={() => {
                    onSetSelected(selected.concat(item) as Profile[])
                    setSearch('')
                }}
                ListItemProps={{ style }}
            />
        )
    }
}
SelectProfileUI.defaultProps = {
    frozenSelected: [],
}
function FrozenChip(item: Profile) {
    return <ProfileInChip disabled key={item.identifier.toText()} item={item} />
}
