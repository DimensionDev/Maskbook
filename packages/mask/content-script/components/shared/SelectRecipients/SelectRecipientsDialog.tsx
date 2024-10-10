import { startTransition, useCallback, useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { compact } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { ActionButtonPromise, EmptyStatus, InjectedDialog } from '@masknet/shared'
import type { ProfileInformation as Profile, ProfileInformationFromNextID } from '@masknet/shared-base'
import { Boundary, LoadingBase, makeStyles } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import Fuse from 'fuse.js'
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
import { attachNextIDToProfile } from '../../../../shared/index.js'
import { ProfileInList } from './ProfileInList.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        background: theme.palette.maskColor.input,
        fontSize: 14,
        marginBottom: 16,
    },
    inputFocused: {
        background: theme.palette.maskColor.bottom,
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
        backgroundColor: theme.palette.maskColor.bottom,
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
            theme.palette.mode === 'light' ?
                ' 0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12);',
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

interface SelectRecipientsDialogUIProps {
    open: boolean
    items: Profile[]
    selected: Profile[]
    disabled: boolean
    submitDisabled: boolean
    loading?: boolean
    searchEmptyText?: ReactNode
    onSubmit: () => void
    onClose: () => void
    onSearch(v: string): void
    onSetSelected(selected: Profile[]): void
}
export function SelectRecipientsDialogUI(props: SelectRecipientsDialogUIProps) {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const { items, onSearch } = props
    const [searchInput, setSearchInput] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(searchInput))
    const [selectedAllProfiles, setSelectedAllProfiles] = useState<readonly Profile[]>([])
    const keyword = registeredAddress || searchInput

    const results = useMemo(() => {
        if (!keyword) return items

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

    const onSelectedProfile = useCallback((item: Profile, checked: boolean) => {
        if (checked) {
            setSelectedAllProfiles((profiles) => [...profiles, item])
        } else setSelectedAllProfiles((profiles) => profiles.filter((x) => x !== item))
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
        [results],
    )

    return (
        <InjectedDialog
            className={classes.root}
            open={props.open}
            title={<Trans>Share with</Trans>}
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
                    placeholder={_(msg`eg: X accounts, persona public keys, wallet addresses or ENS`)}
                />
                {props.loading ?
                    <div className={cx(classes.empty, classes.mainText)}>
                        <LoadingBase />
                        <Typography>
                            <Trans>Loading</Trans>
                        </Typography>
                    </div>
                :   <Boundary>
                        <div className={classes.listParent}>
                            <div className={classes.listBody}>
                                <div className={classes.list}>
                                    {results.length === 0 ?
                                        <EmptyStatus className={classes.empty}>
                                            {props.searchEmptyText ?? (
                                                <Trans>No friends are stored locally, please try search one.</Trans>
                                            )}
                                        </EmptyStatus>
                                    :   results.map((item, index) => {
                                            const pubkey = item.linkedPersona?.publicKeyAsHex as string
                                            const selected = selectedPubkeyList.includes(pubkey)
                                            return (
                                                <ProfileInList
                                                    key={index}
                                                    profile={item as ProfileInformationFromNextID}
                                                    highlightText={keyword}
                                                    selected={selected}
                                                    disabled={props.disabled}
                                                    onChange={onSelectedProfile}
                                                />
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            {results.length > 0 ?
                                <Stack alignItems="center" flexDirection="row" sx={{ padding: '16px 0' }}>
                                    <Checkbox
                                        size="small"
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
            </DialogContent>
            <DialogActions style={{ padding: 0 }}>
                <div className={classes.actions}>
                    <Button
                        className={classes.back}
                        fullWidth
                        variant="roundedContained"
                        disabled={props.submitDisabled}
                        onClick={handleClose}>
                        <Trans>Back</Trans>
                    </Button>
                    <ActionButtonPromise
                        className={classes.done}
                        fullWidth
                        variant="roundedContained"
                        disabled={props.submitDisabled}
                        executor={handleSubmit}
                        completeIcon={null}
                        failIcon={null}
                        failedOnClick="use executor"
                        complete={<Trans>Done</Trans>}
                        init={<Trans>Done</Trans>}
                        waiting={<Trans>Done</Trans>}
                    />
                </div>
            </DialogActions>
        </InjectedDialog>
    )
}
