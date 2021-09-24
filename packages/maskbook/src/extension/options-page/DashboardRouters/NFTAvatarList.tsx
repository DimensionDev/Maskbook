import { FormattedAddress } from '@masknet/shared'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { resolveOpenSeaLink, useAccount } from '@masknet/web3-shared'
import {
    Box,
    Button,
    IconButton,
    Link,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ThemeProvider,
    Typography,
} from '@material-ui/core'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'

import { extendsTheme, useI18N } from '../../../utils'
import { DashboardBindNFTAvatarDialog } from '../DashboardDialogs/Avatar'
import { useModal } from '../DashboardDialogs/Base'
import DashboardRouterContainer from './Container'
import LaunchIcon from '@material-ui/icons/Launch'
import urlcat from 'urlcat'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { DashboardUnbindNFTAvatarDialog } from '../DashboardDialogs/Avatar/confirm'
import { useCallback, useEffect, useState } from 'react'
import { remove } from 'lodash-es'
import { useNFTAvatars } from '../../../components/InjectedComponents/NFT/hooks'
import type { AvatarMetaDB } from '../../../components/InjectedComponents/NFT/types'
import { saveNFTAvatar, setOrClearAvatar } from '../../../components/InjectedComponents/NFT/gun'
import { createNFT } from '../../../components/InjectedComponents/NFT/utils'

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
    return (
        <DashboardRouterContainer title={t('settings_nft_avatar_whitelist')}>
            <ThemeProvider theme={settingsTheme}>
                <NFTAvatarWhitelist />
            </ThemeProvider>
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
        paddingTop: theme.spacing(1),
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

function NFTAvatarWhitelist() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const { value: _avatars, loading } = useNFTAvatars()
    const { enqueueSnackbar } = useSnackbar()
    const [avatars, setAvatars] = useState<AvatarMetaDB[]>([])

    const onAdd = useCallback(
        async (userId: string, avatarId: string, address: string, tokenId: string) => {
            const nft = await createNFT(account, address, tokenId)
            const avatar = await saveNFTAvatar(userId, avatarId, nft)

            enqueueSnackbar('Add Success', { variant: 'success' })
            setAvatars((v) => [...v, avatar])
        },
        [saveNFTAvatar, enqueueSnackbar],
    )

    const [bindNFTAvatarDialog, openBindNFTAvatarDialog] = useModal(DashboardBindNFTAvatarDialog, { onAdd })
    const onDeleted = useCallback(
        async (avatar) => {
            setAvatars((x) => remove([...x], (i) => i.userId !== avatar.userId))
            setOrClearAvatar(avatar.userId)
                .then(() => {
                    enqueueSnackbar('Remove Success', { variant: 'success' })
                })
                .catch((error) => enqueueSnackbar(error.message, { variant: 'error' }))
        },
        [setOrClearAvatar],
    )

    useEffect(() => {
        if (!_avatars) return
        setAvatars(_avatars)
    }, [_avatars])

    return (
        <Paper elevation={0}>
            <Box className={classes.addToken}>
                <Button variant="outlined" onClick={openBindNFTAvatarDialog}>
                    Add NFT Avatar
                </Button>
            </Box>
            <Box className={classes.list}>
                <TableContainer>
                    <Table component="table" size="medium" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        User ID
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        Avatar ID
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        Contract Address
                                    </Typography>
                                </TableCell>
                                <TableCell align="left">
                                    <Typography variant="body1" color="textPrimary" className={classes.title}>
                                        Token ID
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
            {bindNFTAvatarDialog}
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
