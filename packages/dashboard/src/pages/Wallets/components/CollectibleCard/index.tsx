import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useHoverDirty } from 'react-use'
import { WalletIcon, AssetPreviewer } from '@masknet/shared'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useDashboardI18N } from '../../../../locales/index.js'
import { ChangeNetworkTip } from '../FungibleTokenTableRow/ChangeNetworkTip.js'
import {
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkDescriptor,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'

const useStyles = makeStyles()((theme) => ({
    container: {
        paddingTop: 8,
        paddingBottom: 8,
    },
    hover: {
        paddingTop: 0,
        paddingBottom: 0,
        transform: 'scale(1.1)',
        filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.1))',
    },
    card: {
        position: 'relative',
        borderRadius: 8,
        width: 140,
        minHeight: 215,
        backgroundColor: theme.palette.mode === 'dark' ? MaskColorVar.lineLight : MaskColorVar.lightestBackground,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    mediaContainer: {
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        height: 186,
        backgroundColor: theme.palette.mode === 'dark' ? MaskColorVar.lineLight : '#f6f6f7',
    },
    description: {
        flex: 1,
        flexGrow: 1,
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: 12,
    },
    chainIcon: {
        position: 'absolute',
        right: 8,
        top: 8,
        height: 20,
        width: 20,
        zIndex: 20,
    },
    tip: {
        padding: theme.spacing(1),
        background: '#111432',
    },
    tipArrow: {
        color: '#111432',
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
    link: {
        position: 'relative',
        width: 140,
        height: 186,
    },
    blocker: {
        position: 'absolute',
        zIndex: 2,
        width: 140,
        height: 186,
    },
}))

export interface CollectibleCardProps {
    asset: Web3Helper.NonFungibleAssetScope<'all'>
    onSend(): void
}

export const CollectibleCard = memo<CollectibleCardProps>(({ asset, onSend }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const ref = useRef(null)
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const { Others } = useWeb3State()
    const networkDescriptor = useNetworkDescriptor(pluginID, asset.contract?.chainId)
    const [isHoveringTooltip, setHoveringTooltip] = useState(false)
    const isHovering = useHoverDirty(ref)
    const isOnCurrentChain = useMemo(() => chainId === asset.contract?.chainId, [chainId, asset])

    useEffect(() => {
        setHoveringTooltip(false)
    }, [chainId])

    // Sending NFT is only available on EVM currently.
    const showSendButton = (isHovering || isHoveringTooltip) && pluginID === NetworkPluginID.PLUGIN_EVM

    const nftLink = useMemo(() => {
        return Others?.explorerResolver.nonFungibleTokenLink(asset.chainId, asset.address, asset.tokenId)
    }, [asset.chainId, asset.address, asset.tokenId, Others])

    return (
        <Box className={`${classes.container} ${isHovering || isHoveringTooltip ? classes.hover : ''}`} ref={ref}>
            <div className={classes.card}>
                <Box className={classes.chainIcon}>
                    <WalletIcon mainIcon={networkDescriptor?.icon} size={20} />
                </Box>
                <Link
                    target={asset.link ?? nftLink ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className={classes.link}
                    href={asset.link ?? nftLink}>
                    <div className={classes.blocker} />
                    <div className={classes.mediaContainer}>
                        <AssetPreviewer
                            pluginID={pluginID}
                            chainId={asset.chainId}
                            url={asset.metadata?.imageURL || asset.metadata?.mediaURL}
                            classes={{
                                fallbackImage: classes.fallbackImage,
                            }}
                        />
                    </div>
                </Link>
                <Box className={classes.description} py={1} px={3}>
                    {showSendButton ? (
                        <Box>
                            <Tooltip
                                onOpen={() => setHoveringTooltip(true)}
                                onClose={() => setHoveringTooltip(false)}
                                disableHoverListener={isOnCurrentChain}
                                title={<ChangeNetworkTip chainId={asset.contract?.chainId} />}
                                placement="top"
                                classes={{ tooltip: classes.tip, arrow: classes.tipArrow }}
                                arrow>
                                <span>
                                    <Button
                                        size="small"
                                        fullWidth
                                        disabled={!isOnCurrentChain}
                                        onClick={onSend}
                                        variant="rounded"
                                        style={{ boxShadow: 'none' }}
                                        sx={{ fontWeight: 'bolder', height: '28px' }}>
                                        {t.send()}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Typography className={classes.name} color="textPrimary" variant="body2" onClick={onSend}>
                            {asset.metadata?.name || asset.tokenId}
                        </Typography>
                    )}
                </Box>
            </div>
        </Box>
    )
})
