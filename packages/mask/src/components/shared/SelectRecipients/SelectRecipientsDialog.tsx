import { startTransition, useCallback, useDeferredValue, useMemo, useState } from 'react'
import { compact } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { InjectedDialog } from '@masknet/shared'
import type { ProfileInformation as Profile, ProfileInformationFromNextID } from '@masknet/shared-base'
import { Boundary, LoadingBase, makeStyles } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { Fuse } from '@masknet/web3-providers'
import {
    Button,
    Checkbox,
    DialogActions,
    DialogContent,
    InputAdornment,
    InputBase,
    Stack,
    Typography,
    alpha,
} from '@mui/material'
import { attachNextIDToProfile, useI18N } from '../../../utils/index.js'
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
        display: 'flex',
        flexDirection: 'column',
    },
    listBody: {
        height: 400,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        overflowY: 'auto',
        flex: 1,
    },
    list: {
        gridGap: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        alignItems: 'flex-start',
    },
    actions: {
        display: 'flex',
        gap: 16,
        padding: 16,
        boxSizing: 'border-box',
        alignItems: 'center',
        background: alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'light'
                ? ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12);',
        borderRadius: '0px 0px 12px 12px',
        flex: 1,
        backdropFilter: 'blur(8px)',
    },
    back: {
        color: theme.palette.maskColor.main,
        background: theme.palette.maskColor.thirdMain,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        '&:hover': {
            color: theme.palette.maskColor.main,
            background: theme.palette.maskColor.thirdMain,
            fontSize: 14,
            fontWeight: 700,
            lineHeight: '18px',
        },
    },
    done: {
        color: theme.palette.maskColor.bottom,
        background: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
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
    onSearch(v: string): void
    onSetSelected(selected: Profile[]): void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const { items, onSearch } = props
    const [searchInput, setSearchInput] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(searchInput))
    const [selectedAllProfiles, setSelectedAllProfiles] = useState<Profile[]>(props.items)
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

    const handleSubmit = useCallback(async () => {
        props.onSetSelected([...selectedAllProfiles])
        for (const item of selectedAllProfiles) {
            await attachNextIDToProfile(item as ProfileInformationFromNextID)
        }
        props.onSubmit()
        setSearchInput('')
        onSearch('')
    }, [selectedAllProfiles])

    const onSelectedProfiles = useCallback((item: Profile, checked: boolean) => {
        if (checked) {
            setSelectedAllProfiles((profiles) => [...profiles, item])
        } else
            setSelectedAllProfiles((profiles) =>
                profiles.filter((x) => x.linkedPersona?.publicKeyAsHex !== item.linkedPersona?.publicKeyAsHex),
            )
    }, [])

    const selectedPubkeyList = compact(selectedAllProfiles.map((x) => x.linkedPersona?.publicKeyAsHex))

    const onSelectedAllChange = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedAllProfiles([...results])
            } else {
                setSelectedAllProfiles([])
            }
        },
        [results, props.items],
    )

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
                            <div className={classes.listBody}>
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
                                                    onChange={(_, checked) => onSelectedProfiles(item, checked)}
                                                />
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                            {results.length > 0 ? (
                                <Stack alignItems="center" flexDirection="row">
                                    <Checkbox onChange={(e) => onSelectedAllChange(e.currentTarget.checked)} />
                                    <Typography>{t('select_all')}</Typography>
                                </Stack>
                            ) : null}
                        </div>
                    </Boundary>
                )}
            </DialogContent>
            <DialogActions style={{ padding: 0 }}>
                <div className={classes.actions}>
                    <Button
                        className={classes.back}
                        fullWidth
                        variant="roundedContained"
                        disabled={props.submitDisabled}
                        onClick={handleClose}>
                        {t('back')}
                    </Button>
                    <Button
                        className={classes.done}
                        fullWidth
                        variant="roundedContained"
                        disabled={props.submitDisabled}
                        onClick={handleSubmit}>
                        {t('done')}
                    </Button>
                </div>
            </DialogActions>
        </InjectedDialog>
    )
}
