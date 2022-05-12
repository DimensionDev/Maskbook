import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'
import { useHoverDirty } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { WalletIcon, NFTCardStyledAssetPlayer } from '@masknet/shared'
import { ChangeNetworkTip } from '../FungibleTokenTableRow/ChangeNetworkTip'
import {
    NetworkPluginID,
    useNetworkDescriptor,
    useCurrentWeb3NetworkPluginID,
    useWeb3State,
    Web3Plugin,
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
        filter: 'drop-shadow(0px 12px 28px rgba(0, 0, 0, 0.1))',
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
        minHeight: '0px !important',
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
    chainId: number
    token: Web3Plugin.NonFungibleToken
    onSend(): void
    renderOrder: number
}

export const CollectibleCard = memo<CollectibleCardProps>(({ chainId, token, onSend, renderOrder }) => {
    const t = useDashboardI18N()
    const { Utils } = useWeb3State()
    const { classes } = useStyles()
    const ref = useRef(null)
    const [isHoveringTooltip, setHoveringTooltip] = useState(false)
    const isHovering = useHoverDirty(ref)
    const networkDescriptor = useNetworkDescriptor(token.contract?.chainId)
    const isOnCurrentChain = useMemo(() => chainId === token.contract?.chainId, [chainId, token])
    const currentPluginId = useCurrentWeb3NetworkPluginID()

    useEffect(() => {
        setHoveringTooltip(false)
    }, [chainId])

    // Sending NFT is only available on EVM currently.
    const sendable = currentPluginId === NetworkPluginID.PLUGIN_EVM
    const showSendButton = (isHovering || isHoveringTooltip) && sendable

    let nftLink
    if (Utils?.resolveNonFungibleTokenLink && token.contract) {
        nftLink = Utils?.resolveNonFungibleTokenLink?.(token.contract?.chainId, token.contract.address, token.tokenId)
    }

    return (
        <Box className={`${classes.container} ${isHovering || isHoveringTooltip ? classes.hover : ''}`} ref={ref}>
            <div className={classes.card}>
                <Box className={classes.chainIcon}>
                    <WalletIcon mainIcon={networkDescriptor?.icon} size={20} />
                </Box>
                {(token.metadata?.assetURL || token.metadata?.iconURL) && token.contract ? (
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
                                url={token.metadata.assetURL || token.metadata.iconURL}
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
                            {token.name || token.tokenId}
                        </Typography>
                    )}
                </Box>
            </div>
        </Box>
    )
})
