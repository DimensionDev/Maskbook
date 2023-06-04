import { useState, useCallback, startTransition, useMemo, useDeferredValue } from 'react'
import { InputBase, Box, Typography, Stack, Checkbox, InputAdornment } from '@mui/material'
import { Boundary, LoadingBase, makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/index.js'
import type { ProfileInformation as Profile, ProfileInformationFromNextID } from '@masknet/shared-base'
import { ProfileInChip } from './ProfileInChip.js'
import { ProfileInList } from '../SelectRecipients/ProfileInList.js'
import { Icons } from '@masknet/icons'
import { compact } from 'lodash-es'
import { EmptyStatus } from '@masknet/shared'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { Fuse } from '@masknet/web3-providers'

export interface SelectProfileUIProps extends withClasses<'root'> {
    items: Profile[]
    selected: Profile[]
    frozenSelected: Profile[]
    onSetSelected(selected: Profile[]): void
    disabled?: boolean
    onSearch(v: string): void
    loading: boolean
}
const useStyles = makeStyles()((theme) => ({
    selectedArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        display: 'flex',
        padding: 0,
    },
    input: {
        flex: 1,
        marginBottom: theme.spacing(2),
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
    mainText: {
        color: theme.palette.text.primary,
    },
}))

export function SelectProfileUI(props: SelectProfileUIProps) {
    const { t } = useI18N()
    const { classes, cx } = useStyles(undefined, { props })
    const { frozenSelected, onSetSelected, disabled, items, selected } = props
    const [search, setSearch] = useState('')

    const listBeforeSearch = items.filter((x) => {
        if (selected.find((y) => x.identifier === y.identifier)) return false
        return true
    })
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(search))
    const keyword = registeredAddress || search

    const listAfterSearch = listBeforeSearch.filter((x) => {
        if (frozenSelected.find((y) => x.identifier === y.identifier)) return false
        if (search === '') return true
        return (
            !!x.identifier.userId.toLowerCase().match(search.toLowerCase()) ||
            !!x.linkedPersona?.rawPublicKey?.toLowerCase().match(search.toLowerCase()) ||
            !!(x.nickname || '').toLowerCase().match(search.toLowerCase())
        )
    })

    const selectedPubkeyList = compact(selected.map((x) => x.linkedPersona?.publicKeyAsHex))
    const frozenPubkeyList = compact(frozenSelected.map((x) => x.linkedPersona?.publicKeyAsHex))

    const onSelectedAllChange = useCallback(
        (checked: boolean) => {
            if (checked) {
                onSetSelected([...items])
            } else {
                onSetSelected([])
            }
        },
        [items],
    )

    const onSelectedProfiles = useCallback(
        (item: Profile, checked: boolean) => {
            if (checked) {
                onSetSelected([...selected, item])
            } else
                onSetSelected(
                    selected.filter((x) => x.linkedPersona?.publicKeyAsHex !== item.linkedPersona?.publicKeyAsHex),
                )
        },
        [selected],
    )

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
            .filter((x) => !frozenPubkeyList.includes(x.linkedPersona?.publicKeyAsHex!))
    }, [keyword, items, frozenPubkeyList])

    const isEmpty = frozenSelected.length === 0 && results.length === 0 && items.length === 0

    return (
        <div className={classes.root}>
            <Box
                className={classes.selectedArea}
                sx={{
                    display: 'flex',
                }}>
                <InputBase
                    className={classes.input}
                    value={disabled ? '' : search}
                    onChange={useCallback(
                        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearch(e.target.value),
                        [],
                    )}
                    onKeyDown={(e) => {
                        if (e.code !== 'Enter') return

                        // onSetSelected(selected.slice(0, selected.length - 1))
                        startTransition(() => props.onSearch(search))
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Icons.Search />
                        </InputAdornment>
                    }
                    placeholder={t('post_dialog_share_with_input_placeholder')}
                    disabled={disabled}
                />
            </Box>
            {props.loading ? (
                <div className={cx(classes.empty, classes.mainText)}>
                    <LoadingBase />
                    <Typography>{t('loading')}</Typography>
                </div>
            ) : (
                <Boundary>
                    <div className={classes.listParent}>
                        <div className={classes.listBody}>
                            <Box className={classes.list}>
                                {isEmpty ? (
                                    <EmptyStatus className={classes.empty}>
                                        {t('compose_encrypt_share_dialog_empty')}
                                    </EmptyStatus>
                                ) : (
                                    [...frozenSelected, ...results].map((item) => {
                                        const pubkey = item.linkedPersona?.publicKeyAsHex as string
                                        const selected = selectedPubkeyList.includes(pubkey)
                                        const disabled = frozenPubkeyList.includes(pubkey)
                                        return (
                                            <ProfileInList
                                                key={item.linkedPersona?.publicKeyAsHex ?? item.identifier.toText()}
                                                item={item as ProfileInformationFromNextID}
                                                disabled={disabled}
                                                selected={selected || disabled}
                                                onChange={(_, checked: boolean) => onSelectedProfiles(item, checked)}
                                            />
                                        )
                                    })
                                )}
                            </Box>
                        </div>
                        {!isEmpty ? (
                            <Stack alignItems="center" flexDirection="row" sx={{ padding: '16px 0px' }}>
                                <Checkbox
                                    sx={{ width: 20, height: 20 }}
                                    onChange={(e) => onSelectedAllChange(e.currentTarget.checked)}
                                />
                                <Typography sx={{ paddingLeft: 1 }}>{t('select_all')}</Typography>
                            </Stack>
                        ) : null}
                    </div>
                </Boundary>
            )}
        </div>
    )
}
function FrozenChip(item: Profile) {
    return <ProfileInChip disabled key={item.identifier.toText()} item={item} />
}
