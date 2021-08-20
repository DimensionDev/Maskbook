import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import Fuse from 'fuse.js'
import { InputBase, DialogContent, List, ListItem, ListItemText, DialogActions, Button } from '@material-ui/core'
import { useState, useMemo } from 'react'
import type { UnlockLocks } from '../types'
import { LockInList } from './LockInList'
import { useI18N } from '../../../utils'

export interface SelectRecipientsUnlockDialogUIProps extends withClasses<never> {
    open: boolean
    items: UnlockLocks[]
    selected: UnlockLocks[]
    disabled: boolean
    disabledItems?: UnlockLocks[]
    chain: number
    onClose: () => void
    onSelect: (item: UnlockLocks) => void
    onDeselect: (item: UnlockLocks) => void
    setChain: (chain: number) => void
}

export function SelectRecipientsUnlockDialogUI(props: SelectRecipientsUnlockDialogUIProps) {
    const { t } = useI18N()
    const [search, setSearch] = useState('')
    const LIST_ITEM_HEIGHT = 40
    const { items, disabledItems } = props
    const itemsAfterSearch = useMemo(() => {
        const fuse = new Fuse(items, {
            keys: ['lock.name', 'lock.address'],
            isCaseSensitive: false,
            ignoreLocation: true,
            threshold: 0,
        })

        return search === '' ? items : fuse.search(search).map((item) => item.item)
    }, [search, items])

    return (
        <InjectedDialog open={props.open} title={t('plugin_unlockprotocol_select_unlock_lock')} onClose={props.onClose}>
            <DialogContent>
                <InputBase value={search} onChange={(e) => setSearch(e.target.value)} />

                <List style={{ height: items.length * LIST_ITEM_HEIGHT || 40 }} dense>
                    {itemsAfterSearch.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={t('plugin_unlockprotocol_no_lock_found')} />
                        </ListItem>
                    ) : (
                        itemsAfterSearch.map((item) => (
                            <LockInList
                                item={item}
                                search={search}
                                checked={props.selected.some((x) => x.lock.address === item.lock.address)}
                                disabled={props.disabled || disabledItems?.includes(item)}
                                onChange={(_, checked) => {
                                    if (checked) {
                                        props.onSelect(item)
                                    } else {
                                        props.onDeselect(item)
                                    }
                                }}
                            />
                        ))
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button style={{ marginLeft: 'auto' }} variant="contained" onClick={props.onClose}>
                    {t('plugin_unlockprotocol_submit_post')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
