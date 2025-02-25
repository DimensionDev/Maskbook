import { Trans } from '@lingui/react/macro'
import { CollectionList, UserAssetsProvider } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { alpha, Box, Button, DialogActions } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NFT_RED_PACKET_MAX_SHARES } from '../../constants.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'

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
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const navigate = useNavigate()
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
    return (
        <Box className={classes.container}>
            <UserAssetsProvider
                pluginID={NetworkPluginID.PLUGIN_EVM}
                account={account}
                multiple
                selectMode
                maxSelection={NFT_RED_PACKET_MAX_SHARES}
                maxSelectionDescription={
                    <Trans>The maximum number of NFTs to be sold in one collection lucky drop contract is 255.</Trans>
                }
                selectedAssets={pendingNfts}>
                <CollectionList height={564} gridProps={gridProps} disableWindowScroll onItemClick={handleItemClick} />
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
                        navigate(-1)
                    }}>
                    <Trans>Confirm</Trans>
                </Button>
            </DialogActions>
        </Box>
    )
}
