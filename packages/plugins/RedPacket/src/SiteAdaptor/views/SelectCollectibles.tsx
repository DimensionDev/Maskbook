import { Trans } from '@lingui/react/macro'
import { AddCollectiblesModal, CollectionList, useAssetsNetworks, UserAssetsProvider } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext, useWeb3Connection, useWeb3Hub } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { alpha, Box, Button, DialogActions } from '@mui/material'
import { compact, uniqBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NFT_DEFAULT_CHAINS, NFT_RED_PACKET_MAX_SHARES } from '../../constants.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { emitter } from '../emitter.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'relative',
    },
    dialogActions: {
        padding: 16,
        boxSizing: 'border-box',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        zIndex: 3,
        bottom: 0,
        width: '100%',
        backgroundColor: alpha(theme.palette.maskColor.bottom, 0.8),
        backdropFilter: 'blur(8px)',
    },
    cancel: {
        '&:hover': {
            border: 'none',
            background: theme.palette.maskColor.bottom,
        },
    },
}))

const gridProps = {
    columns: 'repeat(auto-fill, minmax(20%, 1fr))',
}
export function SelectCollectibles() {
    const { classes } = useStyles()
    const { account, chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [assetChainId, setAssetChainId] = useState<ChainId>()
    const navigate = useNavigate()
    const { pluginID } = useNetworkContext()
    const Web3 = useWeb3Connection(pluginID)
    const Hub = useWeb3Hub(pluginID)
    const networks = useAssetsNetworks(pluginID)
    const { selectedNfts, setSelectedNfts, setCollection } = useRedPacket()
    const [pendingNfts, setPendingNfts] = useState<Web3Helper.NonFungibleAssetAll[]>(selectedNfts)
    const handleItemClick = useCallback((nft: Web3Helper.NonFungibleAssetAll) => {
        setPendingNfts((pendingNfts) => {
            const isSameCollection = pendingNfts.every(
                (n) => n.chainId === nft.chainId && isSameAddress(n.address, nft.address),
            )
            if (!isSameCollection) return [nft]
            const selected = pendingNfts.find(
                (n) => n.chainId === nft.chainId && isSameAddress(n.address, nft.address) && n.tokenId === nft.tokenId,
            )
            return selected ? pendingNfts.filter((n) => n !== selected) : [...pendingNfts, nft]
        })
    }, [])
    const noChanges = useMemo(() => {
        const pendingSet = new Set(pendingNfts.map((x) => [x.chainId, x.address, x.tokenId].join(':').toLowerCase()))
        const selectedSet = new Set(selectedNfts.map((x) => [x.chainId, x.address, x.tokenId].join(':').toLowerCase()))
        return pendingSet.difference(selectedSet).size === 0
    }, [pendingNfts, selectedNfts])

    const [pendingTokenCount, setPendingTokenCount] = useState(0)
    const [tokens, setTokens] = useState<Web3Helper.NonFungibleAssetAll[]>([])
    const handleAddCollectibles = useCallback(async () => {
        const chainWhiteList = networks
            .filter((x) => NFT_DEFAULT_CHAINS.includes(x.chainId as ChainId))
            .map((x) => x.chainId)
        const results = await AddCollectiblesModal.openAndWaitForClose({
            pluginID,
            chainId: assetChainId || chainId,
            account,
            chainWhiteList,
        })
        if (!results) return
        const [contract, tokenIds] = results
        const selectedChainId = contract.chainId || assetChainId || chainId
        const address = contract.address
        setPendingTokenCount((count) => count + tokenIds.length)
        const allSettled = await Promise.allSettled(
            tokenIds.map(async (tokenId) => {
                const [asset, token, isOwner] = await Promise.all([
                    Hub.getNonFungibleAsset(address, tokenId, {
                        chainId: selectedChainId,
                        account,
                    }),
                    Web3.getNonFungibleToken(address, tokenId, undefined, {
                        chainId: selectedChainId,
                    }),
                    Web3.getNonFungibleTokenOwnership(address, tokenId, account, undefined, {
                        chainId: selectedChainId,
                    }),
                ])

                if (!asset?.contract?.chainId || !token.chainId || token.contract?.chainId !== assetChainId) return
                if (!isOwner) return
                return { ...token, ...asset } as Web3Helper.NonFungibleAssetAll
            }),
        )

        setPendingTokenCount((count) => Math.max(count - tokenIds.length, 0))
        const tokens = compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)))
        if (!tokens.length) return
        setTokens((originalTokens) => {
            return uniqBy([...originalTokens, ...tokens], (x) => `${x.contract?.address}.${x.tokenId}`)
        })
    }, [pluginID, assetChainId, chainId, account, networks])

    const handleSelect = useCallback((assets: Web3Helper.NonFungibleAssetAll[]) => {
        setPendingNfts(assets.length > NFT_RED_PACKET_MAX_SHARES ? assets.slice(0, NFT_RED_PACKET_MAX_SHARES) : assets)
    }, [])

    useEffect(() => {
        const unsubscribe = emitter.on('add', handleAddCollectibles)
        return () => {
            unsubscribe()
        }
    }, [handleAddCollectibles])

    return (
        <Box className={classes.container}>
            <UserAssetsProvider
                pluginID={NetworkPluginID.PLUGIN_EVM}
                chainWhiteList={NFT_DEFAULT_CHAINS}
                account={account}
                multiple
                selectMode
                maxSelection={NFT_RED_PACKET_MAX_SHARES}
                maxSelectionDescription={
                    <Trans>The maximum number of NFTs to be sold in one collection lucky drop contract is 255.</Trans>
                }
                selectedAssets={pendingNfts}
                disableReport>
                <CollectionList
                    height={564}
                    gridProps={gridProps}
                    disableWindowScroll
                    additionalAssets={tokens}
                    pendingAdditionalAssetCount={pendingTokenCount}
                    onItemClick={handleItemClick}
                    onChainChange={setAssetChainId as (chainId?: Web3Helper.ChainIdAll) => void}
                    onSelect={handleSelect}
                />
            </UserAssetsProvider>
            <DialogActions className={classes.dialogActions}>
                <Button className={classes.cancel} fullWidth variant="outlined" onClick={() => navigate(-1)}>
                    <Trans>Cancel</Trans>
                </Button>
                <Button
                    variant="contained"
                    disabled={noChanges || pendingNfts.length === 0}
                    fullWidth
                    onClick={() => {
                        setSelectedNfts(pendingNfts)
                        setCollection(pendingNfts[0].collection)
                        setChainId(pendingNfts[0].chainId as ChainId)
                        navigate(-1)
                    }}>
                    <Trans>Confirm</Trans>
                </Button>
            </DialogActions>
        </Box>
    )
}
