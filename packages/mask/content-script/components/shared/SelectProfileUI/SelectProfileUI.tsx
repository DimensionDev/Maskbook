import { Icons } from '@masknet/icons'
import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { EMPTY_LIST, type ProfileInformation as Profile, type ProfileInformationFromNextID } from '@masknet/shared-base'
import { Boundary, makeStyles } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import Fuse from 'fuse.js'
import { Box, Checkbox, InputAdornment, InputBase, Stack, Typography } from '@mui/material'
import { compact, uniqBy } from 'lodash-es'
import { startTransition, useCallback, useDeferredValue, useMemo, useState } from 'react'
import { ProfileInList } from '../SelectRecipients/ProfileInList.js'
import { useContacts } from '../SelectRecipients/useContacts.js'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface SelectProfileUIProps extends withClasses<'root'> {
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
    const { _ } = useLingui()
    const { classes, cx } = useStyles(undefined, { props })
    const { frozenSelected, onSetSelected, disabled, items, selected } = props
    const [search, setSearch] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(search))
    const keyword = registeredAddress || search
    const selectedPubkeyList = compact(selected.map((x) => x.linkedPersona?.publicKeyAsHex))
    const frozenPubkeyList = useMemo(
        () => compact(frozenSelected.map((x) => x.linkedPersona?.publicKeyAsHex)),
        [frozenSelected],
    )
    const { value = EMPTY_LIST } = useContacts(activatedSiteAdaptorUI!.networkIdentifier)

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

    const onSelectedProfile = useCallback(
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

    const fuse = useMemo(() => {
        return new Fuse(items, {
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
    }, [items])

    const results = useMemo(() => {
        if (!keyword) return items
        return fuse
            .search(keyword)
            .map((item) => item.item)
            .filter((x) => x.linkedPersona && !frozenPubkeyList.includes(x.linkedPersona.publicKeyAsHex))
    }, [keyword, frozenPubkeyList, fuse, items])

    const profiles = uniqBy([...frozenSelected, ...results, ...value], (x) => x.identifier)

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
                        startTransition(() => props.onSearch(keyword))
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Icons.Search />
                        </InputAdornment>
                    }
                    placeholder={_(msg`eg: X accounts, persona public keys, wallet addresses or ENS`)}
                    disabled={disabled}
                />
            </Box>
            {props.loading ?
                <div className={cx(classes.empty, classes.mainText)}>
                    <LoadingStatus />
                </div>
            :   <Boundary>
                    <div className={classes.listParent}>
                        <div className={classes.listBody}>
                            <Box className={classes.list}>
                                {profiles.length === 0 ?
                                    <EmptyStatus className={classes.empty}>
                                        <Trans>No friends are stored locally, please try search one.</Trans>
                                    </EmptyStatus>
                                :   profiles.map((item) => {
                                        const pubkey = item.linkedPersona?.publicKeyAsHex as string
                                        const selected = selectedPubkeyList.includes(pubkey)
                                        const disabled = frozenPubkeyList.includes(pubkey)
                                        return (
                                            <ProfileInList
                                                key={item.linkedPersona?.publicKeyAsHex ?? item.identifier.toText()}
                                                profile={item as ProfileInformationFromNextID}
                                                disabled={disabled}
                                                selected={selected || disabled}
                                                onChange={onSelectedProfile}
                                            />
                                        )
                                    })
                                }
                            </Box>
                        </div>
                        {profiles.length ?
                            <Stack alignItems="center" flexDirection="row" sx={{ padding: '16px 0px' }}>
                                <Checkbox
                                    sx={{ width: 20, height: 20 }}
                                    onChange={(e) => onSelectedAllChange(e.currentTarget.checked)}
                                />
                                <Typography sx={{ paddingLeft: 1 }}>
                                    <Trans>Select All</Trans>
                                </Typography>
                            </Stack>
                        :   null}
                    </div>
                </Boundary>
            }
        </div>
    )
}
