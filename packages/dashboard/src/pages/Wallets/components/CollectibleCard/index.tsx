import { memo, useEffect, useRef, useState } from 'react'
import { Box, Link } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'
import { useHoverDirty } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { WalletIcon, NFTCardStyledAssetPlayer } from '@masknet/shared'
import { useNetworkDescriptor, useWeb3State } from '@masknet/plugin-infra'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-base'

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
    iframe: {
        height: '160px !important',
    },
}))

export interface CollectibleCardProps {
    chainId: number
    token: ERC721TokenDetailed
    renderOrder: number
}

export const CollectibleCard = memo<CollectibleCardProps>(({ chainId, token, renderOrder }) => {
    const t = useDashboardI18N()
    const { Utils } = useWeb3State()
    const { classes } = useStyles()
    const ref = useRef(null)
    const [isHoveringTooltip, setHoveringTooltip] = useState(false)
    const isHovering = useHoverDirty(ref)
    const networkDescriptor = useNetworkDescriptor(token.contractDetailed?.chainId)

    useEffect(() => {
        setHoveringTooltip(false)
    }, [chainId])

    let nftLink
    if (Utils?.resolveNonFungibleTokenLink && token.contractDetailed) {
        nftLink = Utils?.resolveNonFungibleTokenLink?.(
            token.contractDetailed?.chainId,
            token.contractDetailed.address,
            token.tokenId,
        )
    }

    return (
        <Box className={`${classes.container} ${isHovering || isHoveringTooltip ? classes.hover : ''}`} ref={ref}>
            <div className={classes.card}>
                <Box className={classes.chainIcon}>
                    <WalletIcon networkIcon={networkDescriptor?.icon} size={20} />
                </Box>
                {(token.info.mediaUrl ||
                    token.contractDetailed?.iconURL ||
                    token.info.imageURL ||
                    token.info.tokenURI) &&
                token.contractDetailed ? (
                    <Link
                        target={nftLink ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className={classes.linkWrapper}
                        href={nftLink}>
                        <div className={classes.blocker} />
                        <div className={classes.mediaContainer}>
                            <NFTCardStyledAssetPlayer
                                contractAddress={token.contractDetailed.address}
                                chainId={token.contractDetailed.chainId}
                                renderOrder={renderOrder}
                                url={token.info.mediaUrl || token.contractDetailed?.iconURL}
                                tokenURI={token.info.tokenURI}
                                tokenId={token.tokenId}
                                classes={{
                                    loadingFailImage: classes.loadingFailImage,
                                    wrapper: classes.wrapper,
                                    iframe: classes.iframe,
                                }}
                            />
                        </div>
                    </Link>
                ) : (
                    <Box>
                        <CollectiblePlaceholder chainId={token.contractDetailed?.chainId} />
                    </Box>
                )}
            </div>
        </Box>
    )
})
