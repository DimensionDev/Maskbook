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
import { compact, range, uniqBy } from 'lodash-es'
import { useCallback, useState } from 'react'
import { useI18N } from '../locales/i18n_generated.js'
import type { AllChainsNonFungibleToken, SelectTokenInfo } from '../types.js'
import { NFTImage } from './NFTImage.js'

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
    const t = useI18N()
    const {
        value: collectibles = EMPTY_LIST,
        done: loadFinish,
        next: nextPage,
        error: loadError,
    } = useNonFungibleAssets(pluginID, undefined, { chainId, account })

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
        const { results: result } = await AddCollectiblesModal.openAndWaitForClose({
            pluginID,
            chainId,
        })
        if (!result || !chainId) return
        const [contract, tokenIds] = result
        const address = contract.address
        const results = await Promise.allSettled(
            tokenIds.map(async (tokenId) => {
                const [asset, token, isOwner] = await Promise.all([
                    Hub.getNonFungibleAsset(address, tokenId, {
                        chainId,
                        account,
                    }),
                    Web3.getNonFungibleToken(address, tokenId, undefined, {
                        chainId,
                    }),
                    Web3.getNonFungibleTokenOwnership(address, tokenId, account, undefined, {
                        chainId,
                    }),
                ])

                if (!asset?.contract?.chainId || !token.chainId || token.contract?.chainId !== chainId) return
                if (!isOwner) return
                return { ...token, ...asset } as AllChainsNonFungibleToken
            }),
        )
        const tokens = compact(results.map((x) => (x.status === 'fulfilled' ? x.value : null)))
        if (!tokens.length) return
        setSelectedToken(tokens[0])
        setCustomCollectibles((tokens) => uniqBy([...tokens, ...tokens], (x) => x.contract?.address && x.tokenId))
    }, [pluginID, chainId, account])

    const loadingSkeletons = (
        <List className={classes.list}>
            {range(8).map((i) => (
                <ListItem key={i} className={classes.nftItem}>
                    <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
                </ListItem>
            ))}
        </List>
    )

    return (
        <Box className={classes.root}>
            <Box className={classes.title}>
                <Typography variant="body1" color="textPrimary">
                    {t.nft_list_title()}
                </Typography>
                {account ? (
                    <Typography variant="body1" color="textPrimary" className={classes.account}>
                        {t.nft_wallet_label()}: <ReversedAddress address={account} size={4} />
                        {!hideWallet ? (
                            <Button
                                variant="text"
                                onClick={() => SelectProviderModal.open()}
                                size="small"
                                className={classes.changeButton}>
                                {t.nft_wallet_change()}
                            </Button>
                        ) : null}
                    </Typography>
                ) : null}
            </Box>
            <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId as ChainId}>
                <Box className={classes.galleryItem}>
                    {!loadFinish && !loadError && !collectibles.length ? (
                        loadingSkeletons
                    ) : loadError || (!collectibles.length && !customCollectibles.length) ? (
                        <ReloadStatus
                            message={t.dashboard_no_collectible_found()}
                            actionLabel={t.retry()}
                            onRetry={nextPage}
                        />
                    ) : (
                        <List className={classes.list}>
                            {uniqBy(
                                [...customCollectibles, ...collectibles],
                                (x) => x.contract?.address && x.tokenId,
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
                                    nextPage?.()
                                }}>
                                {!loadFinish && <LoadingBase />}
                            </ElementAnchor>
                        </List>
                    )}
                </Box>

                <Box className={classes.buttons}>
                    <Button variant="outlined" size="small" onClick={handleAddCollectibles}>
                        {t.add_collectible()}
                    </Button>

                    <Button variant="contained" size="small" onClick={onClick} disabled={!selectedToken}>
                        {t.set_avatar_title()}
                    </Button>
                </Box>
            </ChainBoundary>
        </Box>
    )
}
