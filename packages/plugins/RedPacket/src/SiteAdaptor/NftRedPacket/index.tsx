import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { usePostLink } from '@masknet/plugin-infra/content-script'
import { share } from '@masknet/plugin-infra/content-script/context'
import { LoadingStatus, ReloadStatus, TransactionConfirmModal } from '@masknet/shared'
import { NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import {
    NetworkContextProvider,
    useChainContext,
    useNetwork,
    useNonFungibleAsset,
    useWeb3Hub,
} from '@masknet/web3-hooks-base'
import { type RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { TokenType } from '@masknet/web3-shared-base'
import { signMessage } from '@masknet/web3-shared-evm'
import { Card } from '@mui/material'
import { useCallback, useEffect, useMemo } from 'react'
import { useAvailabilityNftRedPacket } from '../hooks/useAvailabilityNftRedPacket.js'
import { useClaimNftRedpacketCallback } from '../hooks/useClaimNftRedpacketCallback.js'
import { useNftRedPacketContract } from '../hooks/useNftRedPacketContract.js'
import { OperationFooter } from './OperationFooter.js'
import { NftRedPacketEnvelope } from '../components/NftRedPacketEnvelope.js'
import { useRedPacketCover } from './useRedPacketCover.js'

const useStyles = makeStyles<{ claimed: boolean }>()((theme) => ({
    root: {
        position: 'relative',
        width: '100%',
    },
    card: {
        borderRadius: theme.spacing(2),
        position: 'relative',
        display: 'flex',
        backgroundColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        color: theme.palette.common.white,
        flexDirection: 'column',
        gap: theme.spacing(2),
        justifyContent: 'space-between',
        margin: theme.spacing(0, 'auto', 2),
        boxSizing: 'border-box',
        width: 'calc(100% - 32px)',
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            padding: theme.spacing(1, 1.5),
            width: 'calc(100% - 20px)',
        },
        padding: 0,
        aspectRatio: '480 / 336',
    },
    footer: {
        margin: theme.spacing(2),
    },
}))
export interface NftRedPacketProps {
    payload: RedPacketNftJSONPayload
    currentPluginID: NetworkPluginID
}

export function NftRedPacket({ payload, currentPluginID }: NftRedPacketProps) {
    const { _ } = useLingui()
    const pluginID = NetworkPluginID.PLUGIN_EVM
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
        payload.id,
        availability?.totalAmount,
        signMessage(account, payload.privateKey).signature ?? '',
    )

    useEffect(() => {
        retryAvailability()
    }, [account])
    const network = useNetwork(pluginID, payload.chainId)
    const outdated = !!(availability?.isClaimedAll || availability?.isCompleted || availability?.expired)

    const { classes } = useStyles({ claimed: !!availability?.isClaimed })
    // #region on share
    const postLink = usePostLink()
    const promote_short = _(msg`🧧🧧🧧 Try sending Lucky Drop to your friends with Mask.io.`)
    const account_promote = useMemo(() => {
        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        return (
            isOnTwitter ? _(msg`Follow @realMaskNetwork (mask.io) to claim NFT lucky drops.`)
            : isOnFacebook ? _(msg`Follow @masknetwork (mask.io) to claim NFT lucky drops.`)
            : ''
        )
    }, [_])
    // #endregion

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

        const sender = payload.senderName
        const networkName = network?.name || ''
        const shareText = _(
            msg`@${sender} is sending an NFT lucky drop on ${networkName} network. ${account_promote} ${promote_short} #mask_io #LuckyDrop ${postLink}`,
        )
        const token = await Hub.getNonFungibleAsset(payload.contractAddress, availability.claimed_id)

        TransactionConfirmModal.open({
            shareText,
            nonFungibleTokenId: availability.claimed_id,
            nonFungibleTokenAddress: payload.contractAddress,
            tokenType: TokenType.NonFungible,
            messageTextForNFT: _(msg`1 ${token?.contract?.name || 'NFT'} claimed.`),
            messageTextForFT: _(msg`You claimed 1.`),
            title: _(msg`Lucky Drop`),
            share,
        })
    }, [
        nftRedPacketContract,
        payload.id,
        account,
        Hub,
        payload.senderName,
        payload.contractAddress,
        network?.name,
        account_promote,
        promote_short,
        postLink,
        _,
    ])

    const { showSnackbar } = useCustomSnackbar()
    const claim = useCallback(async () => {
        const hash = await claimCallback()
        await checkResult()
        if (typeof hash === 'string') {
            retryAvailability()
        } else if (hash instanceof Error) {
            showSnackbar(hash.message, {
                variant: 'error',
            })
        }
    }, [claimCallback, checkResult, retryAvailability, showSnackbar])

    const { data: cover } = useRedPacketCover({
        rpid: payload.id,
        symbol: asset?.metadata?.symbol ?? 'N/A',
        shares: availability?.totalAmount ?? 1,
        total: availability?.totalAmount ?? 1,
        sender: payload.senderName,
        message: payload.message,
        claimedShares: availability?.claimedAmount,
    })

    if (availabilityError)
        return <ReloadStatus message={<Trans>Something went wrong.</Trans>} onRetry={retryAvailability} />

    if (!availability || loading || !asset) return <LoadingStatus minHeight={148} iconSize={24} />

    const card = (
        <Card className={classes.card} component="article" elevation={0}>
            <NftRedPacketEnvelope
                cover={cover?.backgroundImageUrl || new URL('../assets/cover.png', import.meta.url).href}
                message={payload.message}
                creator={payload.senderName}
                asset={asset}
                shares={availability.totalAmount}
                claimedCount={+availability.claimedAmount}
                total={availability.totalAmount}
                isClaimed={availability.isClaimed}
                isExpired={availability.isEnd}
            />
        </Card>
    )
    return (
        <div className={classes.root}>
            {card}
            {outdated ? null : (
                <NetworkContextProvider initialNetwork={currentPluginID}>
                    <OperationFooter
                        className={classes.footer}
                        chainId={payload.chainId}
                        isClaiming={isClaiming}
                        claimed={availability.isClaimed}
                        onClaim={claim}
                    />
                </NetworkContextProvider>
            )}
        </div>
    )
}
