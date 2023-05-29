import { useState, useCallback } from 'react'
import { InputBase, Box, Typography, Stack, Checkbox, InputAdornment } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/index.js'
import type { ProfileInformation as Profile, ProfileInformationFromNextID } from '@masknet/shared-base'
import { ProfileInChip } from './ProfileInChip.js'
import { ProfileInList } from '../SelectRecipients/ProfileInList.js'
import { Icons } from '@masknet/icons'
import { compact, uniqBy } from 'lodash-es'

export interface SelectProfileUIProps extends withClasses<'root'> {
    items: Profile[]
    selected: Profile[]
    frozenSelected: Profile[]
    onSetSelected(selected: Profile[]): void
    disabled?: boolean
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
}))

export function SelectProfileUI(props: SelectProfileUIProps) {
    const { t } = useI18N()
    const { classes } = useStyles(undefined, { props })

    const { frozenSelected, onSetSelected, disabled, items, selected } = props

    const [search, setSearch] = useState('')
    const listBeforeSearch = items.filter((x) => {
        if (selected.find((y) => x.identifier === y.identifier)) return false
        return true
    })
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
        [items, selected],
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

    const isEmpty = listBeforeSearch.length > 0 && listAfterSearch.length === 0 && search
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
                    onKeyDown={(event) => {
                        if (search !== '' || event.key !== 'Backspace') return
                        onSetSelected(selected.slice(0, selected.length - 1))
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Icons.Search />
                        </InputAdornment>
                    }
                    placeholder={disabled ? '' : t('search_box_placeholder')}
                    disabled={disabled}
                />
            </Box>
            <div className={classes.listParent}>
                <div className={classes.listBody}>
                    <Box className={classes.list}>
                        {isEmpty ? (
                            <div className={classes.empty}>
                                <Icons.EmptySimple size={36} />
                                <Typography>{t('no_search_result')}</Typography>
                            </div>
                        ) : (
                            uniqBy([...frozenSelected, ...items], (x) => x.identifier).map((item) => {
                                const pubkey = item.linkedPersona?.publicKeyAsHex as string
                                const selected = selectedPubkeyList.includes(pubkey)
                                const disabled = frozenPubkeyList.includes(pubkey)
                                return (
                                    <ProfileInList
                                        key={item.identifier.toText()}
                                        item={item as ProfileInformationFromNextID}
                                        disabled={disabled}
                                        selected={selected}
                                        onChange={(_, checked: boolean) => onSelectedProfiles(item, checked)}
                                    />
                                )
                            })
                        )}
                    </Box>
                </div>
                {!isEmpty ? (
                    <Stack alignItems="center" flexDirection="row">
                        <Checkbox onChange={(e) => onSelectedAllChange(e.currentTarget.checked)} />
                        <Typography>{t('select_all')}</Typography>
                    </Stack>
                ) : null}
            </div>
        </div>
    )
}
function FrozenChip(item: Profile) {
    return <ProfileInChip disabled key={item.identifier.toText()} item={item} />
}
