import { useCallback, useState } from 'react'
import { compact, range, uniqBy } from 'lodash-es'
import {
    AddCollectiblesModal,
    ChainBoundary,
    ElementAnchor,
    ReloadStatus,
    ReversedAddress,
    SelectProviderModal,
    isSameNFT,
} from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import {
    useChainContext,
    useNetworkContext,
    useNonFungibleAssets,
    useWeb3Connection,
    useWeb3Hub,
} from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, List, ListItem, Skeleton, Typography } from '@mui/material'
import type { AllChainsNonFungibleToken, SelectTokenInfo } from '../types.js'
import { NFTImage } from './NFTImage.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {},
    title: {
        padding: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    account: {
        display: 'flex',
        alignItems: 'center',
    },
    galleryItem: {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        height: 200,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        overflowY: 'auto',
    },
    skeleton: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        boxSizing: 'border-box',
    },
    changeButton: {
        fontSize: 14,
    },
    buttons: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: theme.spacing(1),
        gap: 16,
    },
    list: {
        gridGap: 13,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        padding: 8,
        overflowY: 'auto',
    },

    nftItem: {
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        overflow: 'hidden',
        padding: 0,
        flexDirection: 'column',
        borderRadius: 12,
        userSelect: 'none',
        justifyContent: 'center',
        lineHeight: 0,
    },
}))

export interface NFTAvatarProps extends withClasses<'root'> {
    onChange: (token: SelectTokenInfo) => void
    hideWallet?: boolean
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { onChange, hideWallet } = props
    const { classes } = useStyles(undefined, { props })
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken>()
    const [customCollectibles, setCustomCollectibles] = useState<AllChainsNonFungibleToken[]>([])
    const {
        data: collectibles = EMPTY_LIST,
        hasNextPage,
        fetchNextPage,
        error: loadError,
    } = useNonFungibleAssets(pluginID, {
        chainId,
        account,
    })

    const onClick = useCallback(async () => {
        if (!selectedToken) return
        onChange({
            account,
            token: selectedToken,
            image: selectedToken.metadata?.imageURL ?? '',
            pluginID,
        })
        setSelectedToken(undefined)
    }, [onChange, selectedToken, pluginID])

    const Web3 = useWeb3Connection(pluginID)
    const Hub = useWeb3Hub(pluginID)

    const handleAddCollectibles = useCallback(async () => {
        if (!chainId) return

        const results = await AddCollectiblesModal.openAndWaitForClose({
            pluginID,
            chainId,
        })
        if (!results) return

        const [contract, tokenIds] = results
        const allSettled = await Promise.allSettled(
            tokenIds.map(async (tokenId) => {
                const [asset, token, isOwner] = await Promise.all([
                    Hub.getNonFungibleAsset(contract.address, tokenId, {
                        chainId,
                        account,
                    }),
                    Web3.getNonFungibleToken(contract.address, tokenId, undefined, {
                        chainId,
                    }),
                    Web3.getNonFungibleTokenOwnership(contract.address, tokenId, account, undefined, {
                        chainId,
                    }),
                ])

                if (!asset?.contract?.chainId || !token.chainId || token.contract?.chainId !== chainId) return
                if (!isOwner) return
                return { ...token, ...asset } as AllChainsNonFungibleToken
            }),
        )
        const fetchedTokens = compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)))
        if (!fetchedTokens.length) return

        setSelectedToken(fetchedTokens[0])
        setCustomCollectibles((tokens) =>
            uniqBy([...tokens, ...fetchedTokens], (x) => `${x.contract?.address}_${x.tokenId}`),
        )
    }, [pluginID, chainId, account])

    return (
        <Box className={classes.root}>
            <Box className={classes.title}>
                <Typography variant="body1" color="textPrimary">
                    <Trans>NFT Avatar Setting</Trans>
                </Typography>
                {account ?
                    <Typography variant="body1" color="textPrimary" className={classes.account}>
                        <Trans>Wallet</Trans>: <ReversedAddress address={account} size={4} />
                        {!hideWallet ?
                            <Button
                                variant="text"
                                onClick={() => SelectProviderModal.open()}
                                size="small"
                                className={classes.changeButton}>
                                <Trans>Change</Trans>
                            </Button>
                        :   null}
                    </Typography>
                :   null}
            </Box>
            <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId as ChainId}>
                <Box className={classes.galleryItem}>
                    {hasNextPage && !loadError && !collectibles.length ?
                        <List className={classes.list}>
                            {range(8).map((i) => (
                                <ListItem key={i} className={classes.nftItem}>
                                    <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
                                </ListItem>
                            ))}
                        </List>
                    : loadError || (!collectibles.length && !customCollectibles.length) ?
                        <ReloadStatus
                            message={<Trans>No collectible found.</Trans>}
                            actionLabel={<Trans>Retry</Trans>}
                            onRetry={fetchNextPage}
                        />
                    :   <List className={classes.list}>
                            {uniqBy(
                                [...customCollectibles, ...collectibles],
                                (x) => `${x.contract?.address}_${x.tokenId}`,
                            ).map((token: AllChainsNonFungibleToken, i) => (
                                <ListItem className={classes.nftItem} key={i}>
                                    <NFTImage
                                        key={i}
                                        token={token}
                                        selected={isSameNFT(NetworkPluginID.PLUGIN_EVM, token, selectedToken)}
                                        onSelect={setSelectedToken}
                                    />
                                </ListItem>
                            ))}
                            <ElementAnchor
                                callback={() => {
                                    fetchNextPage()
                                }}>
                                {hasNextPage ?
                                    <LoadingBase />
                                :   null}
                            </ElementAnchor>
                        </List>
                    }
                </Box>

                <Box className={classes.buttons}>
                    <Button variant="outlined" size="small" onClick={handleAddCollectibles}>
                        <Trans>Add Collectibles</Trans>
                    </Button>

                    <Button variant="contained" size="small" onClick={onClick} disabled={!selectedToken}>
                        <Trans>Set NFT Avatar</Trans>
                    </Button>
                </Box>
            </ChainBoundary>
        </Box>
    )
}
