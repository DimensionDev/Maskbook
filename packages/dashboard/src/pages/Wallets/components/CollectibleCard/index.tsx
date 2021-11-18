import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import { ERC721TokenDetailed, ChainId, CollectibleProvider, resolveCollectibleLink } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'
import { useHoverDirty } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { ChainIcon } from '@masknet/shared'
import { ChangeNetworkTip } from '../TokenTableRow/ChangeNetworkTip'

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
    },
    imgContainer: {
        width: '100%',
        height: 186,
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
    },
    tip: {
        padding: theme.spacing(1),
        background: '#111432',
    },
    tipArrow: {
        color: '#111432',
    },
}))

export interface CollectibleCardProps {
    chainId: ChainId
    provider: CollectibleProvider
    token: ERC721TokenDetailed
    onSend(): void
}

export const CollectibleCard = memo<CollectibleCardProps>(({ chainId, provider, token, onSend }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const ref = useRef(null)
    const [isHoveringTooltip, setHoveringTooltip] = useState(false)
    const isHovering = useHoverDirty(ref)
    const isOnCurrentChain = useMemo(() => chainId === token.contractDetailed.chainId, [chainId, token])

    useEffect(() => {
        setHoveringTooltip(false)
    }, [chainId])

    return (
        <Box className={`${classes.container} ${isHoveringTooltip || isHovering ? classes.hover : ''}`} ref={ref}>
            <div className={classes.card}>
                <Box className={classes.chainIcon}>
                    <ChainIcon chainId={token.contractDetailed.chainId} size={20} />
                </Box>
                {token.info.image ? (
                    <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={resolveCollectibleLink(token.contractDetailed.chainId, provider, token)}>
                        <div className={classes.imgContainer}>
                            <img
                                src={token.info.image}
                                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                            />
                        </div>
                    </Link>
                ) : (
                    <Box>
                        <CollectiblePlaceholder chainId={token.contractDetailed.chainId} />
                    </Box>
                )}
                <Box className={classes.description} py={1} px={3}>
                    {isHovering || isHoveringTooltip ? (
                        <Box>
                            <Tooltip
                                onOpen={() => setHoveringTooltip(true)}
                                onClose={() => setHoveringTooltip(false)}
                                disableHoverListener={isOnCurrentChain}
                                title={<ChangeNetworkTip chainId={token.contractDetailed.chainId} />}
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
                            {token.info.name || token.tokenId}
                        </Typography>
                    )}
                </Box>
            </div>
        </Box>
    )
})
