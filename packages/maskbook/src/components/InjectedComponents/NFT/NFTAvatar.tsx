import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog, useStylesExtends, useValueRef } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import {
    ERC721TokenDetailed,
    formatEthereumAddress,
    useAccount,
    useChainId,
    useCollectibles,
} from '@masknet/web3-shared'
import { Box, Button, Skeleton, TablePagination, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import { head, uniqBy } from 'lodash-es'
import type { Order } from 'opensea-js/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { PluginCollectibleRPC } from '../../../plugins/Collectible/messages'
import { getOrderUnitPrice } from '../../../plugins/Collectible/utils'
import { currentCollectibleDataProviderSettings } from '../../../plugins/Wallet/settings'
import { useI18N } from '../../../utils'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { AddNFT } from './AddNFT'

async function getAvatarGun() {
    // TODO: do not call gun in SNS adaptor.
    const { gun2 } = await import('../../../network/gun/version.2')
    return { gun2 }
}
const useStyles = makeStyles()((theme) => ({
    root: {},
    title: {
        padding: 0,
        display: 'flex',
        justifyContent: 'space-between',
    },
    AddCollectible: {
        textAlign: 'right',
        paddingBottom: theme.spacing(1),
    },
    NFTBox: {
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgb(61, 84, 102)' : 'rgb(207, 217, 222)'}`,
        borderRadius: 4,
        padding: theme.spacing(1),
    },
    NFTImage: {
        display: 'flex',
        flexFlow: 'row wrap',
        height: 150,
        overflowY: 'auto',
        justifyContent: 'center',
    },
    image: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        margin: theme.spacing(0.5, 1.5),
        borderRadius: '100%',
        '&:hover': {
            border: `1px solid ${getMaskColor(theme).blue}`,
        },
        boxSizing: 'border-box',
    },
    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
    },
    setNFTAvatar: {
        paddingLeft: 64,
        paddingRight: 64,
    },
    selected: {
        border: `1px solid ${getMaskColor(theme).blue}`,
    },
    error: {},
}))

export interface NFTAvatarProps extends withClasses<'root'> {
    onChange: (token: ERC721TokenDetailed) => void
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { onChange } = props
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const chainId = useChainId()
    const provider = useValueRef(currentCollectibleDataProviderSettings)
    const [page, setPage] = useState(0)
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>()
    const [open_, setOpen_] = useState(false)
    const [collectibles_, setCollectibles_] = useState<ERC721TokenDetailed[]>([])
    const { t } = useI18N()
    const {
        value = {
            collectibles: [],
            hasNextPage: false,
        },
        loading,
        retry,
        error,
    } = useCollectibles(account, chainId, provider, page, 50)
    //0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

    const { collectibles, hasNextPage } = value

    useEffect(() => {
        setCollectibles_(collectibles)
    }, [collectibles])

    const onClick = useCallback(async () => {
        if (!selectedToken) return
        onChange(selectedToken)
    }, [onChange, selectedToken])

    const onAddClick = useCallback((token) => {
        setSelectedToken(token)
        setCollectibles_((tokens) => uniqBy([token, ...tokens], (x) => x.contractDetailed.address && x.tokenId))
    }, [])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const LoadStatus = Array.from({ length: 6 })
        .fill(0)
        .map((_, i) => <Skeleton animation="wave" variant="rectangular" className={classes.image} key={i} />)
    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>

            <Button className={classes.button} variant="text" onClick={() => retry()}>
                {t('plugin_collectible_retry')}
            </Button>
        </Box>
    )
    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.title}>
                    <Typography variant="body1" color="textPrimary">
                        NFT Avatar Setting
                    </Typography>
                    {account ? (
                        <Typography variant="body1" color="textPrimary">
                            Wallet: {formatEthereumAddress(account, 4)}
                            <Button onClick={openSelectProviderDialog} size="small">
                                Change
                            </Button>
                        </Typography>
                    ) : null}
                </Box>
                <EthereumChainBoundary chainId={chainId}>
                    <Box className={classes.NFTBox}>
                        <Box className={classes.AddCollectible}>
                            <Button variant="outlined" size="small" onClick={() => setOpen_(true)}>
                                Add Collectibles
                            </Button>
                        </Box>
                        <Box className={classes.NFTImage}>
                            {loading
                                ? LoadStatus
                                : error || collectibles_.length === 0
                                ? Retry
                                : collectibles_.map((token: ERC721TokenDetailed, i) => (
                                      <img
                                          key={i}
                                          onClick={() => setSelectedToken(token)}
                                          src={token.info.image}
                                          className={classnames(
                                              classes.image,
                                              selectedToken === token ? classes.selected : '',
                                          )}
                                      />
                                  ))}
                        </Box>

                        {!(page === 0 && collectibles_.length === 0) ? (
                            <TablePagination
                                count={-1}
                                component="div"
                                onPageChange={() => {}}
                                page={page}
                                rowsPerPage={30}
                                rowsPerPageOptions={[30]}
                                labelDisplayedRows={() => null}
                                backIconButtonProps={{
                                    onClick: () => setPage(page - 1),
                                    size: 'small',
                                    disabled: page === 0,
                                }}
                                nextIconButtonProps={{
                                    onClick: () => setPage(page + 1),
                                    disabled: !hasNextPage,
                                    size: 'small',
                                }}
                            />
                        ) : null}
                        <Box className={classes.button}>
                            <Button
                                variant="contained"
                                size="medium"
                                className={classes.setNFTAvatar}
                                onClick={() => onClick()}
                                disabled={!selectedToken}>
                                {t('profile_nft_avatar_set')}
                            </Button>
                        </Box>
                    </Box>
                </EthereumChainBoundary>
            </Box>
            <AddNFT open={open_} onClose={() => setOpen_(false)} onAddClick={onAddClick} />
        </>
    )
}

export interface AvatarMetaDB {
    userId: string
    tokenId: string
    amount: string
    image?: string
    name?: string
    address: string
    avatarId?: string
    symbol: string
}

export async function saveNFTAvatar(userId: string, avatarId: string, contract: string, tokenId: string) {
    const asset = await PluginCollectibleRPC.getAsset(contract, tokenId)

    let orders: Order[] = []
    if (asset.sellOrders?.length) {
        orders = asset.sellOrders
    } else if (asset.orders?.length) {
        orders = asset.orders
    } else if (asset.buyOrders?.length) {
        orders = asset.buyOrders
    }

    const order = head(
        orders.sort(
            (a, b) =>
                new BigNumber(getOrderUnitPrice(a) ?? 0).toNumber() -
                new BigNumber(getOrderUnitPrice(b) ?? 0).toNumber(),
        ),
    )

    const avatarMeta: AvatarMetaDB = {
        amount: order ? new BigNumber(getOrderUnitPrice(order) ?? 0).toFixed() : '0',
        userId,
        address: contract,
        tokenId: tokenId,
        avatarId: avatarId ?? userId,
        name: asset.assetContract.name,
        symbol: asset.assetContract.tokenSymbol,
        image: asset.imageUrl ?? asset.imagePreviewUrl ?? '',
    }

    await setOrClearAvatar(userId, avatarMeta)
    return avatarMeta
}

export function useNFTAvatar(userId?: string) {
    return useAsync(async () => {
        if (!userId) return undefined

        const avatar = await getNFTAvatar(userId)
        return avatar
    }, [userId]).value
}

export async function getNFTAvatar(userId: string) {
    const avatarDB = await (
        await getAvatarGun()
    ).gun2
        .get('com.maskbook.nft.avatar')
        // @ts-expect-error
        .get(userId).then!()
    return avatarDB as AvatarMetaDB
}

export async function setOrClearAvatar(userId: string, avatar?: AvatarMetaDB) {
    await (
        await getAvatarGun()
    ).gun2
        .get('com.maskbook.nft.avatar')
        // @ts-expect-error
        .get(userId)
        // @ts-expect-error
        .put(avatar ? avatar : null).then!()
}
