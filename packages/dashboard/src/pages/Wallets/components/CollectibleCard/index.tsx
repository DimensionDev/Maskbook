import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'
import { useHoverDirty } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { AssetPlayer, WalletIcon } from '@masknet/shared'
import { ChangeNetworkTip } from '../FungibleTokenTableRow/ChangeNetworkTip'
import { useNetworkDescriptor, useWeb3State, Web3Plugin } from '@masknet/plugin-infra'

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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
    const { Utils } = useWeb3State()
    const networkDescriptor = useNetworkDescriptor(token.contract?.chainId)
    const itemRef = useRef(null)
    const [isHoveringTooltip, setHoveringTooltip] = useState(false)
    const isHovering = useHoverDirty(itemRef)
    const tokenLink = useMemo(
        () =>
            Utils?.resolveNonFungibleTokenLink?.(token.contract!.chainId, token.contract!.address, token.tokenId) ??
            '#',
        [Utils, token, chainId],
    )

    useEffect(() => {
        setHoveringTooltip(false)
    }, [chainId])

    return (
        <CollectibleCardUI
            isHover={isHoveringTooltip || isHovering}
            itemRef={itemRef}
            token={token}
            chainId={chainId}
            networkDescriptor={networkDescriptor}
            setHoveringTooltip={setHoveringTooltip}
            link={tokenLink}
            onSend={onSend}
        />
    )
})

interface CollectibleCardUIProps {
    isHover: boolean
    itemRef: React.MutableRefObject<null>
    chainId: number
    token: Web3Plugin.NonFungibleToken
    networkDescriptor: Web3Plugin.NetworkDescriptor | undefined
    link: string
    setHoveringTooltip(hovering: boolean): void
    onSend(): void
}

export const CollectibleCardUI = memo<CollectibleCardUIProps>(
    ({ isHover, itemRef, token, chainId, networkDescriptor, setHoveringTooltip, link, onSend }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        const isOnCurrentChain = useMemo(() => chainId === token.contract?.chainId, [chainId, token])

        return (
            <Box className={`${classes.container} ${isHover ? classes.hover : ''}`} ref={itemRef}>
                <div className={classes.card}>
                    <Box className={classes.chainIcon}>
                        <WalletIcon networkIcon={networkDescriptor?.icon} size={20} />
                    </Box>
                    {token?.metadata?.assetURL || (token?.metadata?.iconURL && token.contract) ? (
                        <Link target="_blank" rel="noopener noreferrer" href={link}>
                            <div className={classes.imgContainer}>
                                <AssetPlayer
                                    url={token?.metadata?.assetURL || token?.metadata?.iconURL}
                                    options={{
                                        playsInline: true,
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
                        {isHover ? (
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
    },
)
