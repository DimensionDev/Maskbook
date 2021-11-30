import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import {
    ERC721TokenDetailed,
    ChainId,
    NonFungibleAssetProvider,
    resolveCollectibleLink,
} from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'
import { useHoverDirty } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { WalletIcon } from '@masknet/shared'
import { ChangeNetworkTip } from '../FungibleTokenTableRow/ChangeNetworkTip'
import { useNetworkDescriptor, Web3Plugin, useWeb3State } from '@masknet/plugin-infra'

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
    imgContainer: {
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
    chainId: number
    token: Web3Plugin.NonFungibleToken
    onSend(): void
}

export const CollectibleCard = memo<CollectibleCardProps>(({ chainId, token, onSend }) => {
    const t = useDashboardI18N()
    const { Utils } = useWeb3State()
    const { classes } = useStyles()
    const ref = useRef(null)
    const [isHoveringTooltip, setHoveringTooltip] = useState(false)
    const isHovering = useHoverDirty(ref)
    const networkDescriptor = useNetworkDescriptor(token.contract?.chainId)
    const isOnCurrentChain = useMemo(() => chainId === token.contract?.chainId, [chainId, token])

    useEffect(() => {
        setHoveringTooltip(false)
    }, [chainId])

    return (
        <Box className={`${classes.container} ${isHoveringTooltip || isHovering ? classes.hover : ''}`} ref={ref}>
            <div className={classes.card}>
                <Box className={classes.chainIcon}>
                    <WalletIcon networkIcon={networkDescriptor?.icon} size={20} />
                </Box>
                {(token.metadata?.assetURL || token.metadata?.iconURL) && token.contract ? (
                    <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={
                            Utils?.resolveCollectibleLink?.(
                                token.contract?.chainId,
                                token.contract.address,
                                token.tokenId,
                            ) ?? '#'
                        }>
                        <div className={classes.imgContainer}>
                            <img
                                src={token.metadata.assetURL || token.metadata.iconURL}
                                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                            />
                        </div>
                    </Link>
                ) : (
                    <Box>
                        <CollectiblePlaceholder chainId={token.contract?.chainId} />
                    </Box>
                )}
                <Box className={classes.description} py={1} px={3}>
                    {isHovering || isHoveringTooltip ? (
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
