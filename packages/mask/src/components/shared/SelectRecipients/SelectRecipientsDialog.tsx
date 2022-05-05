import { makeStyles, useStylesExtends } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { Button, DialogActions, DialogContent, InputBase } from '@mui/material'
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import { useI18N } from '../../../utils'
import { ProfileInList } from './ProfileInList'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '0 !important',
    },
    title: {
        marginLeft: 6,
    },
    input: { flex: 1, width: '100%', marginLeft: 20, marginTop: theme.spacing(1) },
    paper: {
        height: 500,
        position: 'relative',
    },
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    list: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
    },
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
            keys: ['identifier.userId', 'fingerprint', 'nickname'],
            isCaseSensitive: false,
            ignoreLocation: true,
            threshold: 0,
        })
        return search === '' ? items : fuse.search(search).map((item) => item.item)
    }, [search, items])
    const LIST_ITEM_HEIGHT = 56
    const Empty = () => <div className={classes.empty}>no result</div>

    return (
        <InjectedDialog open={props.open} title={t('select_specific_friends_dialog__title')} onClose={props.onClose}>
            <DialogContent className={classes.paper}>
                <InputBase
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={classes.input}
                    placeholder={t('post_dialog_share_with_input_placeholder')}
                />
                {itemsAfterSearch.length === 0 ? <Empty /> : null}
                <div className={classes.list}>
                    {itemsAfterSearch.map((item) => (
                        <ProfileInList
                            key={item.identifier.toText()}
                            item={item}
                            search={search}
                            checked={
                                props.selected.some((x) => x.identifier === item.identifier) ||
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
                    ))}
                </div>
            </DialogContent>
            <DialogActions sx={{ gap: '8px' }}>
                <Button fullWidth variant="roundedFlat" disabled={props.submitDisabled} onClick={props.onSubmit}>
                    {t('cancel')}
                </Button>
                <Button
                    fullWidth
                    variant="roundedContained"
                    disabled={props.submitDisabled}
                    onClick={() => setSearch(search)}>
                    {t('search')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
