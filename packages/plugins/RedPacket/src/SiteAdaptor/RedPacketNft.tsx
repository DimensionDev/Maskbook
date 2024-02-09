import { Icons } from '@masknet/icons'
import { usePostInfoDetails, usePostLink } from '@masknet/plugin-infra/content-script'
import { share } from '@masknet/plugin-infra/content-script/context'
import {
    AssetPreviewer,
    ChainBoundary,
    LoadingStatus,
    NFTFallbackImage,
    ReloadStatus,
    TransactionConfirmModal,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, EnhanceableSite, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { ActionButton, ShadowRootTooltip, makeStyles, useDetectOverflow } from '@masknet/theme'
import {
    useChainContext,
    useNetwork,
    useNetworkContext,
    useNonFungibleAsset,
    useWeb3Hub,
} from '@masknet/web3-hooks-base'
import { type RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { TokenType } from '@masknet/web3-shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, Card, Grow, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRedPacketTrans } from '../locales/index.js'
import { Requirements } from './Requirements.js'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket.js'
import { useClaimNftRedpacketCallback } from './hooks/useClaimNftRedpacketCallback.js'
import { useClaimStrategyStatus } from './hooks/useClaimStrategyStatus.js'
import { useNftRedPacketContract } from './hooks/useNftRedPacketContract.js'
import { useCoverTheme } from './hooks/useRedPacketCoverTheme.js'
import { getRedPacketCover } from './utils/getRedPacketCover.js'

const useStyles = makeStyles<{ outdated: boolean }>()((theme, { outdated }) => ({
    root: {
        position: 'relative',
        width: '100%',
    },
    requirements: {
        width: 407,
        height: 238,
        boxSizing: 'border-box',
        position: 'absolute',
        zIndex: 9,
        inset: 0,
        margin: 'auto',
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
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        margin: 'auto',
        width: 'calc(100% - 32px)',
        marginBottom: outdated ? '12px' : 'auto',
        aspectRatio: '10 / 7',
    },
    cover: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        inset: 0,
        margin: 'auto',
        zIndex: 0,
    },
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.common.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        margin: '0 !important',
    },
    buttonWrapper: {
        marginTop: 0,
        display: 'flex',
    },
    claimedTokenWrapper: {
        background: theme.palette.maskColor.primary,
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
        transform: 'RedPacketTransY(6px)',
        '& > div': {
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
        },
    },
    imgWrapper: {
        maxWidth: 180,
    },
    fallbackImage: {
        height: 160,
        width: 120,
    },
    description: {
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: 126,
        transform: 'RedPacketTransY(3px)',
        fontSize: 13,
        color: theme.palette.common.white,
        lineHeight: '36px',
        minHeight: '1em',
        textIndent: '8px',
    },
    tokenLabel: {
        width: 48,
        height: 48,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(0, 1),
    },
    fallbackImageWrapper: {
        width: '100%',
        height: 126,
        background: theme.palette.common.white,
    },
}))
interface RedPacketNftProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNft({ payload }: RedPacketNftProps) {
    const t = useRedPacketTrans()

    const { pluginID } = useNetworkContext()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>(
        pluginID === NetworkPluginID.PLUGIN_EVM ? {} : { account: '' },
    )
    const {
        data: availability,
        isPending: loading,
        refetch: retryAvailability,
        error: availabilityError,
    } = useAvailabilityNftRedPacket(payload.id, account, payload.chainId)

    const [{ loading: isClaiming }, claimCallback] = useClaimNftRedpacketCallback(
        account,
        payload,
        availability?.totalAmount,
    )
    const [showTooltip, textRef] = useDetectOverflow()

    useEffect(() => {
        retryAvailability()
    }, [account])

    const outdated = !!(availability?.isClaimedAll || availability?.isCompleted || availability?.expired)
    const { classes } = useStyles({ outdated })
    // #region on share
    const postLink = usePostLink()
    const network = useNetwork(pluginID, payload.chainId)
    const site = usePostInfoDetails.site()
    const source = usePostInfoDetails.source()
    const isOnFirefly = site === EnhanceableSite.Firefly
    const postUrl = usePostInfoDetails.url()
    const link = postLink.toString() || postUrl?.toString()
    const shareText = useMemo(() => {
        if (isOnFirefly) {
            return t.share_on_firefly({
                context: source?.toLowerCase() as 'lens' | 'farcaster',
                sender: payload.senderName,
                link: link!,
            })
        }
        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const options = {
            sender: payload.senderName,
            payload: link!,
            network: network?.name || '',
            account_promote: t.account_promote({
                context:
                    isOnTwitter ? 'twitter'
                    : isOnFacebook ? 'facebook'
                    : 'default',
            }),
            interpolation: { escapeValue: false },
        } as const
        if (availability?.isClaimed) {
            return t.nft_share_claimed_message(options)
        }
        return t.nft_share_foreshow_message(options)
    }, [availability?.isClaimed, t, network?.name, link, source, isOnFirefly])

    const onShare = useCallback(() => {
        if (shareText) share?.(shareText)
    }, [shareText])
    // #endregion

    const openNFTDialog = useCallback(() => {
        if (!payload.chainId || !pluginID || !availability?.claimed_id || !availability.token_address) return
        CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
            open: true,
            chainId: payload.chainId,
            pluginID,
            tokenId: availability.claimed_id,
            tokenAddress: availability.token_address,
        })
    }, [pluginID, payload.chainId, availability?.claimed_id, availability?.token_address])

    const { data: asset } = useNonFungibleAsset(
        NetworkPluginID.PLUGIN_EVM,
        payload.contractAddress,
        availability?.claimed_id,
        {
            chainId: payload.chainId,
        },
    )
    const Hub = useWeb3Hub(pluginID, {
        account,
    })
    const nftRedPacketContract = useNftRedPacketContract(payload.chainId)
    const checkResult = useCallback(async () => {
        if (!nftRedPacketContract) return
        const availability = await nftRedPacketContract.methods.check_availability(payload.id).call({
            // check availability is ok w/o account
            from: account,
        })
        if (availability.claimed_id === '0') return

        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const options = {
            sender: payload.senderName,
            payload: postLink.toString(),
            network: network?.name || '',
            account_promote: t.account_promote({
                context:
                    isOnTwitter ? 'twitter'
                    : isOnFacebook ? 'facebook'
                    : 'default',
            }),
            interpolation: { escapeValue: false },
        } as const
        const shareText = t.nft_share_foreshow_message(options)
        const token = await Hub.getNonFungibleAsset(payload.contractAddress, availability.claimed_id)

        TransactionConfirmModal.open({
            shareText,
            amount: '1',
            nonFungibleTokenId: availability.claimed_id,
            nonFungibleTokenAddress: payload.contractAddress,
            tokenType: TokenType.NonFungible,
            messageTextForNFT: t.claim_nft_successful({
                name: token?.contract?.name || 'NFT',
            }),
            messageTextForFT: t.claim_token_successful({
                amount: '1',
                name: '',
            }),
            title: t.lucky_drop(),
            share,
        })
    }, [nftRedPacketContract, payload.id, account, Hub])

    const [showRequirements, setShowRequirements] = useState(false)
    const {
        data: strategyStatusData,
        refetch: recheckClaimStatus,
        isFetching: checkingClaimStatus,
    } = useClaimStrategyStatus(payload)
    const claimStrategyStatus = strategyStatusData?.data
    const claim = useCallback(async () => {
        const { data: newData } = await recheckClaimStatus()
        if (newData?.data.canClaim === false) {
            setShowRequirements(true)
            return
        }
        const hash = await claimCallback()
        await checkResult()
        if (typeof hash === 'string') {
            retryAvailability()
        }
    }, [claimCallback, retryAvailability, recheckClaimStatus])

    const theme = useCoverTheme(payload.id)
    const cover = useMemo(() => {
        if (!availability || !theme) return ''
        return getRedPacketCover({
            symbol: asset?.metadata?.symbol!,
            theme,
            shares: availability.totalAmount,
            amount: availability.totalAmount,
            from: `@${payload.senderName}`,
            message: payload.message,
            'remaining-amount': availability.balance,
            'remaining-shares': availability.remaining,
        })
    }, [asset?.metadata?.symbol, availability, theme])

    if (availabilityError) return <ReloadStatus message={t.go_wrong()} onRetry={retryAvailability} />

    if (!availability || loading || !cover) return <LoadingStatus minHeight={148} iconSize={24} />

    return (
        <div className={classes.root}>
            <Card className={classes.card} component="article" elevation={0}>
                <img className={classes.cover} src={cover} />
                <img
                    src={new URL('./assets/nftLabel.png', import.meta.url).toString()}
                    className={classes.tokenLabel}
                />
                <Stack />

                <Box className={classes.content}>
                    {availability.isClaimed ?
                        <ShadowRootTooltip
                            title={showTooltip ? `${payload.contractName} #${availability.claimed_id}` : undefined}
                            placement="top"
                            disableInteractive
                            arrow
                            PopperProps={{
                                disablePortal: true,
                            }}>
                            <Box className={classes.claimedTokenWrapper}>
                                <Box className={classes.tokenImageWrapper} onClick={openNFTDialog}>
                                    {asset ?
                                        <AssetPreviewer
                                            url={asset.metadata?.imageURL || asset.metadata?.mediaURL}
                                            classes={{
                                                root: classes.imgWrapper,
                                                fallbackImage: classes.fallbackImage,
                                            }}
                                            fallbackImage={
                                                <div className={classes.fallbackImageWrapper}>{NFTFallbackImage}</div>
                                            }
                                        />
                                    :   null}
                                </Box>

                                <div className={classes.description}>
                                    <Typography
                                        className={classes.name}
                                        color="textPrimary"
                                        variant="body2"
                                        ref={textRef}>
                                        {`${payload.contractName} #${availability.claimed_id}`}
                                    </Typography>
                                </div>
                            </Box>
                        </ShadowRootTooltip>
                    :   null}
                </Box>
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
            <Grow in={showRequirements ? !checkingClaimStatus : null} timeout={250}>
                <Requirements
                    className={classes.requirements}
                    statusList={claimStrategyStatus?.claimStrategyStatus ?? EMPTY_LIST}
                    onClose={() => setShowRequirements(false)}
                />
            </Grow>
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
    const { classes } = useStyles({ outdated: false })
    const t = useRedPacketTrans()

    return (
        <Box className={classes.buttonWrapper}>
            <Box sx={{ flex: 1, padding: 1.5 }}>
                <Button
                    variant="roundedDark"
                    startIcon={<Icons.Shared size={18} />}
                    className={classes.button}
                    fullWidth
                    onClick={onShare}>
                    {t.share()}
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
                            startIcon={<Icons.Wallet size={18} />}
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
