import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { InjectedDialog } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Button, DialogActions, DialogContent, InputAdornment, InputBase, Typography } from '@mui/material'
import type {
    ProfileInformation as Profile,
    ProfileInformation,
    ProfileInformationFromNextID,
} from '@masknet/shared-base'
import { useI18N } from '../../../utils/index.js'
import { ProfileInList } from './ProfileInList.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        minHeight: 400,
        minWidth: 400,
        overflow: 'hidden',
    },
    content: {
        padding: '0 !important',
    },
    title: {
        marginLeft: 6,
    },
    inputRoot: {
        padding: '4px 10px',
        borderRadius: 8,
        width: '100%',
        background: theme.palette.background.input,
        border: '1px solid transparent',
        fontSize: 14,
        marginBottom: 16,
    },
    inputFocused: {
        background: 'none',
        borderColor: theme.palette.text.third,
    },
    paper: {
        height: 450,
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
        alignContent: 'baseline',
        gap: 12,
        minHeight: 300,
        maxHeight: 380,
        overflowY: 'auto',
    },
    actions: {
        display: 'flex',
        gap: 8,
        padding: 16,
        boxSizing: 'border-box',
        alignItems: 'center',
        background: theme.palette.background.paper,
        boxShadow: `0px 0px 20px 0px ${theme.palette.background.messageShadow}`,
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
    searchEmptyText?: string
    onSubmit: () => void
    onClose: () => void
    onSelect: (item: ProfileInformationFromNextID | ProfileInformation) => void
    onDeselect: (item: Profile) => void
    onSearch(v: string): void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const { items, disabledItems, onSearch } = props
    const [search, setSearch] = useState('')

    useEffect(() => {
        setSearch('')
        onSearch('')
    }, [props.open])
    const searchedItems = useMemo(() => {
        const fuse = new Fuse(items, {
            keys: [
                'identifier.userId',
                'nickname',
                'walletAddress',
                'linkedPersona.rawPublicKey',
                'linkedPersona.publicKeyAsHex',
                'linkedTwitterNames',
            ],
            isCaseSensitive: false,
            ignoreLocation: true,
            threshold: 0,
        })
        return search === '' ? items : fuse.search(search).map((item) => item.item)
    }, [search, items])
    return (
        <InjectedDialog
            className={classes.root}
            open={props.open}
            title={t('select_specific_friends_dialog__title')}
            onClose={props.onClose}>
            <DialogContent className={classes.paper}>
                <InputBase
                    className={classes.inputRoot}
                    classes={{
                        focused: classes.inputFocused,
                    }}
                    value={search}
                    onKeyUp={(e) => {
                        if (e.code !== 'Enter') return
                        onSearch(search)
                    }}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={() => onSearch(search)}
                    startAdornment={
                        <InputAdornment position="start">
                            <Icons.Search />
                        </InputAdornment>
                    }
                    placeholder={t('post_dialog_share_with_input_placeholder')}
                />
                {props.loading ? (
                    <div className={cx(classes.empty, classes.mainText)}>
                        <LoadingBase />
                        <Typography>{t('loading')}</Typography>
                    </div>
                ) : (
                    <div className={classes.list}>
                        {searchedItems.length === 0 ? (
                            <div className={classes.empty}>
                                <Icons.SearchEmpty size={36} />
                                <Typography>
                                    {props.searchEmptyText ?? t('compose_encrypt_share_dialog_empty')}
                                </Typography>
                            </div>
                        ) : (
                            searchedItems.map((item, idx) => (
                                <ProfileInList
                                    key={idx}
                                    item={item as ProfileInformationFromNextID}
                                    highlightText={search}
                                    selected={
                                        props.selected.some(
                                            (x) =>
                                                x.linkedPersona?.publicKeyAsHex === item.linkedPersona?.publicKeyAsHex,
                                        ) || disabledItems?.includes(item)
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
                    </div>
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth variant="roundedOutlined" disabled={props.submitDisabled} onClick={props.onSubmit}>
                    {t('back')}
                </Button>
                <Button fullWidth variant="roundedContained" disabled={props.submitDisabled} onClick={props.onSubmit}>
                    {t('done')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
