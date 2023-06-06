import { WalletMessages } from '@masknet/plugin-wallet'
import { ChainBoundary, ElementAnchor, ReversedAddress, isSameNFT } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkContext, useNonFungibleAssets } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, List, ListItem, Skeleton, Typography } from '@mui/material'
import { range, uniqBy } from 'lodash-es'
import { useCallback, useState } from 'react'
import { useI18N } from '../locales/i18n_generated.js'
import type { AllChainsNonFungibleToken, SelectTokenInfo } from '../types.js'
import { AddNFT } from './AddNFT.js'
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

    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    skeleton: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        boxSizing: 'border-box',
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
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
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>()
    const [open_, setOpen_] = useState(false)
    const [collectibles_, setCollectibles_] = useState<AllChainsNonFungibleToken[]>([])
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

    const onAddClick = useCallback((token: AllChainsNonFungibleToken) => {
        setSelectedToken(token)
        setCollectibles_((tokens) => uniqBy([token, ...tokens], (x) => x.contract?.address && x.tokenId))
    }, [])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const LoadStatus = (
        <List className={classes.list}>
            {range(8).map((i) => (
                <ListItem key={i} className={classes.nftItem}>
                    <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
                </ListItem>
            ))}
        </List>
    )
    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t.dashboard_no_collectible_found()}</Typography>
            <Button className={classes.button} variant="text" onClick={nextPage}>
                {t.retry()}
            </Button>
        </Box>
    )

    return (
        <>
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
                                    onClick={openSelectProviderDialog}
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
                            LoadStatus
                        ) : loadError || (!collectibles.length && !collectibles_.length) ? (
                            Retry
                        ) : (
                            <List className={classes.list}>
                                {uniqBy(
                                    [...collectibles_, ...(collectibles ?? [])],
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
                                        nextPage()
                                    }}>
                                    {!loadFinish && <LoadingBase />}
                                </ElementAnchor>
                            </List>
                        )}
                    </Box>

                    <Box className={classes.buttons}>
                        <Button variant="outlined" size="small" onClick={() => setOpen_(true)}>
                            {t.add_collectible()}
                        </Button>

                        <Button variant="contained" size="small" onClick={onClick} disabled={!selectedToken}>
                            {t.set_avatar_title()}
                        </Button>
                    </Box>
                </ChainBoundary>
            </Box>
            <AddNFT
                chainId={chainId as ChainId}
                expectedPluginID={pluginID}
                open={open_}
                onClose={() => setOpen_(false)}
                onAddToken={onAddClick}
            />
        </>
    )
}
