import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { List, ListItem, ListItemText, Button, InputBase, DialogContent, DialogActions } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useStylesExtends } from '@masknet/shared'
import { ProfileInList } from './ProfileInList'
import type { Profile } from '../../../database'
import { InjectedDialog } from '../InjectedDialog'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '0 !important',
    },
    title: {
        marginLeft: 6,
    },
    input: { flex: 1, minWidth: '10em', marginLeft: 20, marginTop: theme.spacing(1) },
}))

export interface SelectRecipientsDialogUIProps extends withClasses<never> {
    open: boolean
    items: Profile[]
    selected: Profile[]
    disabled: boolean
    disabledItems?: Profile[]
    submitDisabled: boolean
    onSubmit: () => void
    onClose: () => void
    onSelect: (item: Profile) => void
    onDeselect: (item: Profile) => void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { items, disabledItems } = props
    const [search, setSearch] = useState('')
    const itemsAfterSearch = useMemo(() => {
        const fuse = new Fuse(items, {
            keys: ['identifier.userId', 'linkedPersona.fingerprint', 'nickname'],
            isCaseSensitive: false,
            ignoreLocation: true,
            threshold: 0,
        })

        return search === '' ? items : fuse.search(search).map((item) => item.item)
    }, [search, items])
    const LIST_ITEM_HEIGHT = 56

    return (
        <InjectedDialog open={props.open} title={t('select_specific_friends_dialog__title')} onClose={props.onClose}>
            <DialogContent>
                <InputBase
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={classes.input}
                    placeholder={t('search_box_placeholder')}
                />
                <List style={{ height: items.length * LIST_ITEM_HEIGHT }} dense>
                    {itemsAfterSearch.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={t('no_search_result')} />
                        </ListItem>
                    ) : (
                        itemsAfterSearch.map((item) => (
                            <ProfileInList
                                key={item.identifier.toText()}
                                item={item}
                                search={search}
                                checked={
                                    props.selected.some((x) => x.identifier.equals(item.identifier)) ||
                                    disabledItems?.includes(item)
                                }
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
                <Button
                    style={{ marginLeft: 'auto' }}
                    variant="contained"
                    disabled={props.submitDisabled}
                    onClick={props.onSubmit}>
                    {t('select_specific_friends_dialog__button')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
