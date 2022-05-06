import { makeStyles } from '@masknet/theme'
import { InjectedDialog, useSnackbarCallback, LoadingAnimation } from '@masknet/shared'
import { Button, DialogActions, DialogContent, InputAdornment, InputBase, Typography } from '@mui/material'
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import { useI18N } from '../../../utils'
import { ProfileInList } from './ProfileInList'
import { useCopyToClipboard } from 'react-use'
import { EmptyIcon, SearchIcon } from '@masknet/icons'
import { isValidAddress } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '0 !important',
    },
    title: {
        marginLeft: 6,
    },
    inputRoot: {
        padding: '4px 10px',
        marginTop: theme.spacing(1),
        borderRadius: 8,
        width: '100%',
        background: theme.palette.background.input,
        border: '1px solid transparent',
        fontSize: 14,
        marginBottom: 8,
    },
    inputFocused: {
        background: 'none',
        borderColor: theme.palette.text.third,
    },
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
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    mainText: {
        color: theme.palette.text.primary,
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
    loading?: boolean
    onSubmit: () => void
    onClose: () => void
    onSelect: (item: Profile) => void
    onDeselect: (item: Profile) => void
    onSearch(v: string): void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const { items, disabledItems, onSearch } = props
    const [search, setSearch] = useState('')
    const [, copyToClipboard] = useCopyToClipboard()
    const copyFingerprint = useSnackbarCallback({
        executor: async (v: string) => copyToClipboard(v),
        deps: [],
        successText: 'public key copied',
    })

    const itemsAfterSearch = useMemo(() => {
        const fuse = new Fuse(items, {
            keys: ['identifier.userId', 'fingerprint', 'nickname', 'address'],
            isCaseSensitive: false,
            ignoreLocation: true,
            threshold: 0,
        })
        return search === '' ? items : fuse.search(search).map((item) => item.item)
    }, [search, items])

    const Empty = () => (
        <div className={classes.empty}>
            <EmptyIcon sx={{ fontSize: 60 }} />
            <Typography>No encrypted friends, You can try searching.</Typography>
        </div>
    )

    const LoadingRender = () => (
        <div className={cx(classes.empty, classes.mainText)}>
            <LoadingAnimation style={{ fontSize: '2rem' }} />
            <Typography>Loading</Typography>
        </div>
    )

    return (
        <InjectedDialog open={props.open} title={t('select_specific_friends_dialog__title')} onClose={props.onClose}>
            <DialogContent className={classes.paper}>
                <InputBase
                    className={classes.inputRoot}
                    classes={{
                        focused: classes.inputFocused,
                    }}
                    value={search}
                    onChange={(e) => {
                        const v = e.target.value
                        setSearch(v)
                        if (isValidAddress(v)) {
                            onSearch(v)
                        }
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    }
                    placeholder={t('post_dialog_share_with_input_placeholder')}
                />
                {props.loading ? (
                    <LoadingRender />
                ) : (
                    <div className={classes.list}>
                        {itemsAfterSearch.length === 0 ? <Empty /> : null}
                        {itemsAfterSearch.map((item) => (
                            <ProfileInList
                                onCopy={(v) => copyFingerprint(v)}
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
                )}
            </DialogContent>
            <DialogActions sx={{ gap: '8px' }}>
                <Button fullWidth variant="roundedFlat" disabled={props.submitDisabled} onClick={props.onSubmit}>
                    back
                </Button>
                <Button fullWidth variant="roundedContained" disabled={props.submitDisabled} onClick={props.onSubmit}>
                    {t('done')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
