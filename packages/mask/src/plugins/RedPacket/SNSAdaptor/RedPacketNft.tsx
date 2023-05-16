import { makeStyles, ActionButton, LoadingBase, parseColor, ShadowRootTooltip, useDetectOverflow } from '@masknet/theme'
import { networkResolver, type ChainId } from '@masknet/web3-shared-evm'
import { Card, Typography, Button, Box } from '@mui/material'
import { useTransactionConfirmDialog } from './context/TokenTransactionConfirmDialogContext.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18N as useBaseI18N } from '../../../utils/index.js'
import { useI18N } from '../locales/index.js'
import { WalletConnectedBoundary, ChainBoundary, AssetPreviewer, NFTFallbackImage } from '@masknet/shared'
import type { RedPacketNftJSONPayload } from '../types.js'
import { useClaimNftRedpacketCallback } from './hooks/useClaimNftRedpacketCallback.js'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket.js'
import { usePostLink } from '../../../components/DataSource/usePostInfo.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base.js'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base.js'
import { useChainContext, useWeb3, useNetworkContext, useNonFungibleAsset } from '@masknet/web3-hooks-base'
import { TokenType } from '@masknet/web3-shared-base'
import { NetworkPluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { Stack } from '@mui/system'

const useStyles = makeStyles<{ claimed: boolean; outdated: boolean }>()((theme, { claimed, outdated }) => ({
    root: {
        position: 'relative',
        width: '100%',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.spacing(2),
        padding: theme.spacing(1),
        background: 'transparent',
        justifyContent: 'space-between',
        position: 'relative',
        color: theme.palette.common.white,
        boxSizing: 'border-box',
        backgroundImage: claimed
            ? `url(${new URL('./assets/nftClaimedCover.png', import.meta.url)})`
            : `url(${new URL('./assets/cover.png', import.meta.url)})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: 'calc(100% - 32px)',
        margin: 'auto',
        marginBottom: outdated ? '12px' : 'auto',
        height: 335,
    },
    remain: {
        fontSize: 12,
        fontWeight: 600,
        color: theme.palette.common.white,
    },
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.common.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        margin: '0 !important',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between !important',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
    },
    buttonWrapper: {
        marginTop: 0,
        display: 'flex',
    },
    claimedTokenWrapper: {
        position: 'absolute',
        top: 80,
        right: 50,
        borderRadius: 9,
        cursor: 'pointer',
    },
    tokenImageWrapper: {
        display: 'flex',
        overflow: 'hidden',
        alignItems: 'center',
        height: 126,
        width: 126,
        borderRadius: 8,
        transform: 'translateY(6px)',
        '& > div': {
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
        },
    },
    claimedText: {
        fontSize: 12,
        fontWeight: 600,
    },
    badge: {
        width: 76,
        height: 27,
        display: 'flex',
        color: theme.palette.common.white,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: parseColor(theme.palette.common.black).setAlpha(0.5).toString(),
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
    },
    imgWrapper: {
        maxWidth: 180,
    },
    fallbackImage: {
        height: 160,
        width: 120,
    },
    description: {
        background: theme.palette.maskColor.primary,
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: 126,
        transform: 'translateY(3px)',
        fontSize: 13,
        color: theme.palette.common.white,
        lineHeight: '36px',
        minHeight: '1em',
        textIndent: '8px',
    },
    hidden: {
        visibility: 'hidden',
    },
    tokenLabel: {
        width: 48,
        height: 48,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    messageBox: {
        width: '100%',
    },
    words: {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        color: theme.palette.common.white,
        wordBreak: 'break-all',
        fontSize: 24,
        fontWeight: 700,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: '60%',
        minWidth: 300,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            fontSize: 14,
        },
    },
    from: {
        fontSize: '14px',
        color: theme.palette.common.white,
        alignSelf: 'end',
        fontWeight: 500,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            fontSize: 14,
            right: 12,
            bottom: 8,
        },
    },
    NFTFallbackImageWrapper: {
        width: '100%',
        height: 126,
        background: theme.palette.common.white,
    },
}))
export interface RedPacketNftProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNft({ payload }: RedPacketNftProps) {
    const { t: i18n } = useBaseI18N()
    const t = useI18N()

    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { pluginID } = useNetworkContext()
    const { account, networkType } = useChainContext<NetworkPluginID.PLUGIN_EVM>(
        pluginID === NetworkPluginID.PLUGIN_EVM ? {} : { account: '' },
    )

    const {
        value: availability,
        loading,
        retry: retryAvailability,
        error: availabilityError,
    } = useAvailabilityNftRedPacket(payload.id, account, payload.chainId)

    const [{ loading: isClaiming }, claimCallback] = useClaimNftRedpacketCallback(
        payload.id,
        availability?.totalAmount,
        web3?.eth.accounts.sign(account, payload.privateKey).signature ?? '',
    )

    const [isClaimed, setIsClaimed] = useState(false)
    const [showTooltip, textRef] = useDetectOverflow()
    useEffect(() => {
        setIsClaimed(false)
    }, [account])
    const claim = useCallback(async () => {
        const hash = await claimCallback()
        if (typeof hash === 'string') {
            setIsClaimed(true)
            retryAvailability()
        }
    }, [claimCallback, retryAvailability])

    const openTransactionConfirmDialog = useTransactionConfirmDialog()

    useEffect(() => {
        retryAvailability()
    }, [account])

    const outdated = !!(availability?.isClaimedAll || availability?.isCompleted || availability?.expired)
    const { classes, cx } = useStyles({ claimed: !!availability?.isClaimed, outdated })
    // #region on share
    const postLink = usePostLink()
    const shareText = useMemo(() => {
        const isOnTwitter = isTwitter(activatedSocialNetworkUI)
        const isOnFacebook = isFacebook(activatedSocialNetworkUI)
        const options = {
            sender: payload.senderName,
            payload: postLink.toString(),
            network: networkResolver.networkName(networkType) || '',
            account_promote: t.account_promote({
                context: isOnTwitter ? 'twitter' : isOnFacebook ? 'facebook' : 'default',
            }),
            interpolation: { escapeValue: false },
        } as const
        if (availability?.isClaimed) {
            return t.nft_share_claimed_message(options)
        }
        return t.nft_share_foreshow_message(options)
    }, [availability?.isClaimed, t])

    const onShare = useCallback(() => {
        if (shareText) activatedSocialNetworkUI.utils.share?.(shareText)
    }, [shareText])
    // #endregion

    useEffect(() => {
        if (!isClaimed || !availability || availability?.claimed_id === '0' || !availability?.token_address) return

        openTransactionConfirmDialog({
            shareText,
            amount: '1',
            nonFungibleTokenId: availability?.claimed_id,
            nonFungibleTokenAddress: availability?.token_address,
            tokenType: TokenType.NonFungible,
        })
    }, [isClaimed, openTransactionConfirmDialog, availability?.claimed_id, availability?.token_address])

    const openNFTDialog = useCallback(() => {
        if (!payload.chainId || !pluginID || !availability?.claimed_id || !availability?.token_address) return
        CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
            open: true,
            chainId: payload.chainId,
            pluginID,
            tokenId: availability.claimed_id,
            tokenAddress: availability.token_address,
        })
    }, [pluginID, payload.chainId, availability?.claimed_id, availability?.token_address])

    const { value: NFTDetailed, loading: loadingNFTDetailed } = useNonFungibleAsset<'all'>(
        NetworkPluginID.PLUGIN_EVM,
        payload.contractAddress,
        availability?.claimed_id,
        {
            chainId: payload.chainId,
        },
    )

    if (availabilityError)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ padding: 1.5 }}>
                <Typography color="textPrimary">{i18n('go_wrong')}</Typography>
                <Button variant="roundedDark" onClick={retryAvailability}>
                    {i18n('retry')}
                </Button>
            </Box>
        )

    if (!availability || loading)
        return (
            <Box
                flex={1}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1}
                padding={1}
                minHeight={148}>
                <LoadingBase />
                <Typography>{i18n('loading')}</Typography>
            </Box>
        )

    return (
        <div className={classes.root}>
            <Card className={classes.card} component="article" elevation={0}>
                <img
                    src={new URL('./assets/nftLabel.png', import.meta.url).toString()}
                    className={classes.tokenLabel}
                />
                <Stack />

                <div className={classes.messageBox}>
                    <Typography className={classes.words} variant="h6">
                        {payload.message}
                    </Typography>
                </div>
                <ShadowRootTooltip
                    title={showTooltip ? `${payload.contractName} #${availability.claimed_id}` : undefined}
                    placement="top"
                    disableInteractive
                    arrow
                    PopperProps={{
                        disablePortal: true,
                    }}>
                    <Box className={cx(classes.claimedTokenWrapper, !availability.isClaimed ? classes.hidden : '')}>
                        <Box className={classes.tokenImageWrapper} onClick={openNFTDialog}>
                            {loadingNFTDetailed ? null : (
                                <AssetPreviewer
                                    url={NFTDetailed?.metadata?.imageURL || NFTDetailed?.metadata?.mediaURL}
                                    classes={{
                                        root: classes.imgWrapper,
                                        fallbackImage: classes.fallbackImage,
                                    }}
                                    fallbackImage={
                                        <div className={classes.NFTFallbackImageWrapper}>{NFTFallbackImage}</div>
                                    }
                                />
                            )}
                        </Box>

                        <div className={classes.description}>
                            <Typography className={classes.name} color="textPrimary" variant="body2" ref={textRef}>
                                {`${payload.contractName} #${availability.claimed_id}`}
                            </Typography>
                        </div>
                    </Box>
                </ShadowRootTooltip>

                <div className={classes.footer}>
                    {availability.isClaimed ? (
                        <Typography className={classes.claimedText}>
                            {t.got_nft({ name: payload.contractName || 'NFT' })}
                        </Typography>
                    ) : (
                        <Typography className={classes.remain}>
                            {t.claimed({ amount: `${availability.claimedAmount}/${availability.totalAmount}` })}
                        </Typography>
                    )}
                    <Typography variant="body1" className={classes.from}>
                        {t.from({ name: payload.senderName || '-' })}
                    </Typography>
                </div>

                {availability.isClaimed ? (
                    <div className={classes.badge}>
                        <Typography variant="body2" className={classes.badgeText}>
                            {t.claimed({ amount: '' })}
                        </Typography>
                    </div>
                ) : availability.isEnd ? (
                    <div className={classes.badge}>
                        <Typography variant="body2" className={classes.badgeText}>
                            {availability.expired ? t.expired() : t.completed()}
                        </Typography>
                    </div>
                ) : null}
            </Card>
            {outdated ? null : (
                <OperationFooter
                    chainId={payload.chainId}
                    isClaiming={isClaiming}
                    claimed={availability.isClaimed}
                    onShare={onShare}
                    claim={claim}
                />
            )}
        </div>
    )
}

interface OperationFooterProps {
    claimed: boolean
    isClaiming: boolean
    onShare(): void
    claim(): Promise<void>
    chainId: ChainId
}

function OperationFooter({ claimed, onShare, chainId, claim, isClaiming }: OperationFooterProps) {
    const { classes } = useStyles({ claimed, outdated: false })
    const { t: i18n } = useBaseI18N()
    const t = useI18N()

    return (
        <Box className={classes.buttonWrapper}>
            <Box sx={{ flex: 1, padding: 1.5 }}>
                <Button
                    variant="roundedDark"
                    startIcon={<Icons.Shared size={18} />}
                    className={classes.button}
                    fullWidth
                    onClick={onShare}>
                    {i18n('share')}
                </Button>
            </Box>
            {claimed ? null : (
                <Box sx={{ flex: 1, padding: 1.5 }}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        ActionButtonPromiseProps={{ variant: 'roundedDark' }}
                        expectedChainId={chainId}>
                        <WalletConnectedBoundary
                            expectedChainId={chainId}
                            startIcon={<Icons.ConnectWallet size={18} />}
                            classes={{
                                connectWallet: classes.button,
                            }}
                            ActionButtonProps={{ variant: 'roundedDark' }}>
                            <ActionButton
                                variant="roundedDark"
                                loading={isClaiming}
                                disabled={isClaiming}
                                onClick={claim}
                                className={classes.button}
                                fullWidth>
                                {isClaiming ? t.claiming() : t.claim()}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </Box>
            )}
        </Box>
    )
}
