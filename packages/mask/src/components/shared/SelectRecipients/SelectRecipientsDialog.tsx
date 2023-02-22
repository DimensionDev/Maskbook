import { startTransition, useDeferredValue, useMemo, useState } from 'react'
import { compact } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { InjectedDialog } from '@masknet/shared'
import type {
    ProfileInformation as Profile,
    ProfileInformation,
    ProfileInformationFromNextID,
} from '@masknet/shared-base'
import { Boundary, LoadingBase, makeStyles } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { Fuse } from '@masknet/web3-providers'
import { Button, DialogActions, DialogContent, InputAdornment, InputBase, Typography } from '@mui/material'
import { useI18N } from '../../../utils/index.js'
import { ProfileInList } from './ProfileInList.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        minHeight: 400,
        minWidth: 400,
        overflow: 'hidden',
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
        padding: theme.spacing(2),
        '::-webkit-scrollbar': {
            display: 'none',
        },
        overflow: 'hidden',
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
    listParent: {
        height: 400,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        overflowY: 'auto',
    },
    list: {
        gridGap: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',

        alignItems: 'flex-start',
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

export interface SelectRecipientsDialogUIProps {
    open: boolean
    items: Profile[]
    selected: Profile[]
    disabled: boolean
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
    const { items, onSearch } = props
    const [searchInput, setSearchInput] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(searchInput))

    const keyword = registeredAddress || searchInput

    const results = useMemo(() => {
        if (!keyword) return items

        return Fuse.create(items, {
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
            .search(keyword)
            .map((item) => item.item)
    }, [keyword, items])

    const handleClose = () => {
        props.onClose()
        setSearchInput('')
        onSearch('')
    }
    const handleSubmit = () => {
        props.onSubmit()
        setSearchInput('')
        onSearch('')
    }

    const selectedPubkeyList = compact(props.selected.map((x) => x.linkedPersona?.publicKeyAsHex))

    return (
        <InjectedDialog
            className={classes.root}
            open={props.open}
            title={t('select_specific_friends_dialog__title')}
            onClose={handleClose}>
            <DialogContent className={classes.paper}>
                <InputBase
                    className={classes.inputRoot}
                    classes={{
                        focused: classes.inputFocused,
                    }}
                    value={searchInput}
                    onKeyUp={(e) => {
                        if (e.code !== 'Enter') return
                        startTransition(() => onSearch(keyword))
                    }}
                    onChange={(e) => setSearchInput(e.target.value.trim())}
                    onBlur={() => onSearch(keyword)}
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
                    <Boundary>
                        <div className={classes.listParent}>
                            <div className={classes.list}>
                                {results.length === 0 ? (
                                    <div className={classes.empty}>
                                        <Icons.EmptySimple size={36} />
                                        <Typography>
                                            {props.searchEmptyText ?? t('compose_encrypt_share_dialog_empty')}
                                        </Typography>
                                    </div>
                                ) : (
                                    results.map((item) => {
                                        const pubkey = item.linkedPersona?.publicKeyAsHex as string
                                        const selected = selectedPubkeyList.includes(pubkey)
                                        return (
                                            <ProfileInList
                                                key={pubkey}
                                                item={item as ProfileInformationFromNextID}
                                                highlightText={keyword}
                                                selected={selected}
                                                disabled={props.disabled}
                                                onChange={(_, checked) => {
                                                    if (checked) {
                                                        props.onSelect(item)
                                                    } else {
                                                        props.onDeselect(item)
                                                    }
                                                }}
                                            />
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </Boundary>
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth variant="roundedOutlined" disabled={props.submitDisabled} onClick={handleClose}>
                    {t('back')}
                </Button>
                <Button fullWidth variant="roundedContained" disabled={props.submitDisabled} onClick={handleSubmit}>
                    {t('done')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
