import { FormattedAddress } from '@masknet/shared'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { resolveOpenSeaLink } from '@masknet/web3-shared'
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    IconButton,
    LinearProgress,
    Link,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ThemeProvider,
    Typography,
} from '@material-ui/core'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'

import { extendsTheme, useI18N } from '../../../utils'
import { DashboardBindNFTAvatarDialog } from '../DashboardDialogs/Avatar'
import { useModal } from '../DashboardDialogs/Base'
import DashboardRouterContainer from './Container'
import LaunchIcon from '@material-ui/icons/Launch'
import urlcat from 'urlcat'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { DashboardUnbindNFTAvatarDialog } from '../DashboardDialogs/Avatar/confirm'
import { useCallback, useState, useEffect, useRef } from 'react'
import { remove } from 'lodash-es'
import { useNFTAvatars } from '../../../components/InjectedComponents/NFT/hooks'
import type { AvatarMetaDB } from '../../../components/InjectedComponents/NFT/types'
import { saveNFTAvatar, setOrClearAvatar } from '../../../components/InjectedComponents/NFT/gun'
import { createNFT } from '../../../components/InjectedComponents/NFT/utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'

const settingsTheme = extendsTheme((theme) => ({
    wrapper: {
        padding: theme.spacing(0, 3),
    },
    typography: {
        body1: {
            lineHeight: 1.75,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 12,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    overflow: 'visible',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    paddingTop: theme.spacing(1),
                    paddingBottom: theme.spacing(1),
                },
            },
        },
        button: {},
    },
}))

export function DashboardNFTAvatarsRouter() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [search, setSearch] = useState('')
    const { enqueueSnackbar } = useSnackbar()
    const { value: _avatarList, loading } = useNFTAvatars()
    const [avatars, setAvatars] = useState<AvatarMetaDB[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const [open, setOpen] = useState(false)

    const onAdd = useCallback(
        async (userId: string, avatarId: string, address: string, tokenId: string) => {
            const { token } = await createNFT(address, tokenId)
            const avatar = await saveNFTAvatar(userId, avatarId, token)

            setAvatars((avatars) => [...avatars, avatar])
            enqueueSnackbar(t('nft_dashboard_add_hint'), { variant: 'success' })
        },
        [saveNFTAvatar, enqueueSnackbar],
    )

    useEffect(() => {
        setAvatars(_avatarList ?? [])
        const a = _avatarList?.map((x) => ({
            userId: x.userId,
            avatarId: x.avatarId,
            address: x.address,
            tokenId: x.tokenId,
        }))
        console.log(a)
    }, [_avatarList])

    const [bindNFTAvatarDialog, openBindNFTAvatarDialog] = useModal(DashboardBindNFTAvatarDialog, { onAdd })

    const actions = [
        <TextField
            placeholder={t('search')}
            size="small"
            value={search}
            onChange={(e) => {
                setSearch(e.target.value)
            }}
            InputProps={{
                endAdornment: (
                    <IconButton size="small" onClick={() => setSearch('')}>
                        {search ? <ClearIcon /> : <SearchIcon />}
                    </IconButton>
                ),
            }}
        />,
        <Box className={classes.addToken}>
            <Button variant="outlined" onClick={openBindNFTAvatarDialog} size="medium">
                {t('nft_dashboard_add_avatar_label')}
            </Button>
        </Box>,
        <Box className={classes.addToken}>
            <Button variant="outlined" onClick={() => setOpen(true)} size="medium">
                Import
            </Button>
        </Box>,
    ]

    useEffect(() => {
        if (!search) return
        setAvatars(_avatarList?.filter((x) => x.userId.includes(search)) ?? [])
    }, [search, _avatarList])

    return (
        <DashboardRouterContainer title={t('settings_nft_avatar_whitelist')} actions={actions}>
            <ThemeProvider theme={settingsTheme}>
                <NFTAvatarWhitelist avatarList={avatars} loading={loading} />
            </ThemeProvider>
            {bindNFTAvatarDialog}
            <input
                type="file"
                ref={inputRef}
                accept="files/*.csv"
                hidden
                onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                    if (currentTarget.files) console.log(currentTarget.files.item(0))
                }}
            />
            <ImportFileDialog open={open} onClose={() => setOpen(false)} />
        </DashboardRouterContainer>
    )
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    list: {
        height: '100%',
        overflowY: 'auto',
    },
    addToken: {
        textAlign: 'right',
        paddingRight: theme.spacing(4),
    },
    title: {
        whiteSpace: 'nowrap',
    },
    cell: {},
    tokenId: {
        width: 100,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}))

interface NFTAvatarWhitelistProps {
    loading: boolean
    avatarList: AvatarMetaDB[]
}
function NFTAvatarWhitelist({ loading, avatarList }: NFTAvatarWhitelistProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const { enqueueSnackbar } = useSnackbar()
    const [avatars, setAvatars] = useState<AvatarMetaDB[]>([])

    useEffect(() => {
        setAvatars(avatarList)
    }, [avatarList])
    const onDeleted = useCallback(
        async (avatar) => {
            setAvatars((x) => remove([...x], (i) => i.userId !== avatar.userId))
            setOrClearAvatar(avatar.userId)
                .then(() => {
                    enqueueSnackbar(t('nft_dashboard_remove_hint'), { variant: 'success' })
                })
                .catch((error) => enqueueSnackbar(error.message, { variant: 'error' }))
        },
        [setOrClearAvatar],
    )

    return (
        <Paper elevation={0}>
            <Box className={classes.list}>
                <TableContainer>
                    <Table component="table" size="medium" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        {t('nft_dashboard_input_userid_label')}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        {t('nft_dashboard_input_avatarid_label')}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        {t('nft_dashboard_input_address_label')}
                                    </Typography>
                                </TableCell>
                                <TableCell align="left">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        {t('nft_dashboard_input_tokenid_label')}
                                    </Typography>
                                </TableCell>
                                <TableCell align="left">
                                    <Typography variant="body1" color="textPrimary" className={classes.title} />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <LoadingStatus />
                            ) : avatars.length === 0 ? (
                                <TableRow className={classes.cell}>
                                    <Typography align="center" variant="body1" color="textPrimary">
                                        {t('nft_dashboard_search_not_found')}
                                    </Typography>
                                </TableRow>
                            ) : (
                                avatars
                                    ?.filter((x) => x)
                                    .map((avatar, i) => (
                                        <NFTAvatarWhitelistLine avatar={avatar} key={i} onDeleted={onDeleted} />
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Paper>
    )
}

interface NFTAvatarWhitelistLineProps {
    avatar: AvatarMetaDB
    onDeleted: (avatar: AvatarMetaDB) => void
}
function NFTAvatarWhitelistLine(props: NFTAvatarWhitelistLineProps) {
    const { classes } = useStyles()
    const { avatar, onDeleted } = props

    const _onDeleted = () => onDeleted(avatar)

    const [unbindNFTAvatarDialog, openUnbindNFTAvatarDialog] = useModal(DashboardUnbindNFTAvatarDialog, {
        avatar,
        onDeleted: _onDeleted,
    })
    if (!avatar) return null
    return (
        <TableRow className={classes.cell}>
            <TableCell align="left">
                <Typography variant="body1" color="textPrimary">
                    <FormatLinkUser userId={avatar.userId} />
                </Typography>
            </TableCell>
            <TableCell align="center">
                <Typography variant="body1" color="textPrimary">
                    {avatar.avatarId}
                </Typography>
            </TableCell>
            <TableCell align="center">
                <Typography variant="body1" color="textPrimary">
                    <FormatNFTContract address={avatar.address} size={4} tokenId={avatar.tokenId} />
                </Typography>
            </TableCell>
            <TableCell align="left" size="small">
                <Typography variant="body1" color="textPrimary" className={classes.tokenId}>
                    {avatar.tokenId}
                </Typography>
            </TableCell>
            <TableCell align="right">
                <IconButton color="error" onClick={openUnbindNFTAvatarDialog}>
                    <CancelOutlinedIcon />
                </IconButton>
            </TableCell>
            {unbindNFTAvatarDialog}
        </TableRow>
    )
}

function LoadingStatus() {
    const { classes } = useStyles()
    return (
        <>
            {Array.from({ length: 3 })
                .fill(0)
                .map((_, i) => (
                    <TableRow className={classes.cell} key={i}>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                        </TableCell>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                        </TableCell>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                        </TableCell>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                        </TableCell>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                        </TableCell>
                    </TableRow>
                ))}
        </>
    )
}

interface FormatNFTContractProps {
    address: string
    size: number
    tokenId: string
}

function FormatNFTContract(props: FormatNFTContractProps) {
    const { address, size, tokenId } = props

    if (!tokenId || !address) return null
    return (
        <Link
            href={resolveOpenSeaLink(address, tokenId)}
            title={resolveOpenSeaLink(address, tokenId)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
            style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
            }}>
            <FormattedAddress address={address} size={size} />
            <LaunchIcon fontSize="small" />
        </Link>
    )
}

interface FormatLinkUserProps {
    userId: string
}

function FormatLinkUser({ userId }: FormatLinkUserProps) {
    const currentIdentity = useCurrentIdentity()

    if (!userId) return null
    return (
        <Link
            rel="noopener noreferrer"
            onClick={stop}
            target="_blank"
            href={urlcat('https://:network/:userId', { network: currentIdentity?.identifier.network, userId })}
            title={urlcat('https://:network/:userId', { network: currentIdentity?.identifier.network, userId })}>
            {userId}
        </Link>
    )
}

interface ImportFileDialogProps {
    open: boolean
    onClose: () => void
}

function ImportFileDialog(props: ImportFileDialogProps) {
    const { open, onClose } = props
    const [jsonData, setJsonData] = useState('')
    const [importing, setImporting] = useState(false)
    const [json, setJson] = useState()
    const [message, setMessage] = useState('')
    const [value, setValue] = useState(0)

    const onConfirm = useCallback(() => {
        try {
            const json = JSON.parse(jsonData)
            setJson(json)
            setImporting(true)
            json.map(
                async (data: { userId: string; avatarId: string; tokenId: string; address: string }, i: number) => {
                    setTimeout(async () => {
                        const { token } = await createNFT(data.address, data.tokenId)
                        console.log(token)
                    }, 5000)

                    /*
                    saveNFTAvatar(data.userId, data.avatarId, token)
                        .then(() => {
                            setValue((i / json.length) * 100)
                            setMessage(data.userId)
                        })
                        .catch((error: Error) => setMessage(error.message))
                        */
                },
            )
        } catch {
            console.log('json error')
        }
    }, [jsonData])

    return (
        <InjectedDialog title="Import File" open={open}>
            <DialogContent>
                {importing ? (
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="body1" color="textPrimary">
                            {message}
                        </Typography>
                        <LinearProgress variant="determinate" value={value} />
                    </Box>
                ) : (
                    <TextField fullWidth multiline rows={10} onChange={(e) => setJsonData(e.target.value)} />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm}>Import</Button>
            </DialogActions>
        </InjectedDialog>
    )
}
