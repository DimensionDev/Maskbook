import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useHoverDirty } from 'react-use'
import { WalletIcon, NFTCardStyledAssetPlayer } from '@masknet/shared'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { NetworkPluginID, NonFungibleAsset } from '@masknet/web3-shared-base'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'
import { useDashboardI18N } from '../../../../locales'
import { ChangeNetworkTip } from '../FungibleTokenTableRow/ChangeNetworkTip'
import {
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkDescriptor,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'

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
    loadingFailImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
    wrapper: {
        width: '100%',
        minWidth: 140,
        height: '100%',
        minHeight: 186,
    },
    linkWrapper: {
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
    token: NonFungibleAsset<
        Web3Helper.Definition[NetworkPluginID]['ChainId'],
        Web3Helper.Definition[NetworkPluginID]['SchemaType']
    >
    onSend(): void
    renderOrder: number
}

export const CollectibleCard = memo<CollectibleCardProps>(({ token, onSend, renderOrder }) => {
    const t = useDashboardI18N()
    const chainId = useChainId()
    const { classes } = useStyles()
    const ref = useRef(null)
    const { Others } = useWeb3State() as Web3Helper.Web3StateAll
    const [isHoveringTooltip, setHoveringTooltip] = useState(false)
    const isHovering = useHoverDirty(ref)
    const networkDescriptor = useNetworkDescriptor(undefined, token.contract?.chainId)
    const isOnCurrentChain = useMemo(() => chainId === token.contract?.chainId, [chainId, token])
    const currentPluginId = useCurrentWeb3NetworkPluginID()

    useEffect(() => {
        setHoveringTooltip(false)
    }, [chainId])

    // Sending NFT is only available on EVM currently.
    const sendable = currentPluginId === NetworkPluginID.PLUGIN_EVM
    const showSendButton = (isHovering || isHoveringTooltip) && sendable

    const nftLink = useMemo(() => {
        return Others?.explorerResolver.nonFungibleTokenLink(token.chainId, token.address, token.tokenId)
    }, [currentPluginId, token.chainId, token.address, token.tokenId])

    return (
        <Box className={`${classes.container} ${isHovering || isHoveringTooltip ? classes.hover : ''}`} ref={ref}>
            <div className={classes.card}>
                <Box className={classes.chainIcon}>
                    <WalletIcon networkIcon={networkDescriptor?.icon} size={20} />
                </Box>
                {(token.metadata?.mediaURL || token.metadata?.imageURL) && token.contract ? (
                    <Link
                        target={nftLink ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className={classes.linkWrapper}
                        href={nftLink}>
                        <div className={classes.blocker} />
                        <div className={classes.mediaContainer}>
                            <NFTCardStyledAssetPlayer
                                contractAddress={token.contract.address}
                                chainId={token.contract.chainId}
                                renderOrder={renderOrder}
                                url={token.metadata.imageURL || token.metadata.mediaURL}
                                tokenId={token.tokenId}
                                classes={{
                                    loadingFailImage: classes.loadingFailImage,
                                    wrapper: classes.wrapper,
                                }}
                            />
                        </div>
                    </Link>
                ) : (
                    <Box>
                        <CollectiblePlaceholder chainId={token.contract?.chainId} />
                    </Box>
                )}
                <Box className={classes.description} py={1} px={3}>
                    {showSendButton ? (
                        <Box>
                            <Tooltip
                                onOpen={() => setHoveringTooltip(true)}
                                onClose={() => setHoveringTooltip(false)}
                                disableHoverListener={isOnCurrentChain}
                                title={<ChangeNetworkTip chainId={token.contract?.chainId} />}
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
                            {token.metadata?.name || token.tokenId}
                        </Typography>
                    )}
                </Box>
            </div>
        </Box>
    )
})
