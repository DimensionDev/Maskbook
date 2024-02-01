import { usePostLink } from '@masknet/plugin-infra/content-script'
import { share } from '@masknet/plugin-infra/content-script/context'
import { LoadingStatus, TransactionConfirmModal } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { makeStyles, parseColor } from '@masknet/theme'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext, useNetwork, useNetworkContext } from '@masknet/web3-hooks-base'
import { EVMChainResolver } from '@masknet/web3-providers'
import { RedPacketStatus, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { TokenType, formatBalance, isZero, minus } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Card, Grow, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useRedPacketTrans } from '../../locales/index.js'
import { Requirements } from '../Requirements.js'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed.js'
import { useClaimCallback } from '../hooks/useClaimCallback.js'
import { useRedPacketContract } from '../hooks/useRedPacketContract.js'
import { useCoverTheme } from '../hooks/useRedPacketCoverTheme.js'
import { useRefundCallback } from '../hooks/useRefundCallback.js'
import { useSignedMessage } from '../hooks/useSignedMessage.js'
import { getRedPacketCover } from '../utils/getRedPacketCover.js'
import { OperationFooter } from './OperationFooter.js'

const useStyles = makeStyles<{ outdated: boolean }>()((theme, { outdated }) => {
    return {
        root: {
            borderRadius: theme.spacing(2),
            padding: theme.spacing(1.5, 2),
            position: 'relative',
            display: 'flex',
            backgroundColor: 'transparent',
            color: theme.palette.common.white,
            flexDirection: 'column',
            justifyContent: 'space-between',
            aspectRatio: '10 / 7',
            marginBottom: outdated ? '12px' : 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            boxSizing: 'border-box',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: theme.spacing(1, 1.5),
                height: 202,
            },
            width: 'calc(100% - 32px)',
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
        requirements: {
            width: 407,
            height: 'fit-content',
            boxSizing: 'border-box',
            position: 'absolute',
            zIndex: 9,
            inset: 0,
            margin: 'auto',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        label: {
            width: 76,
            height: 27,
            display: 'flex',
            justifyContent: 'center',
            fontSize: 12,
            alignItems: 'center',
            borderRadius: theme.spacing(1),
            backgroundColor: parseColor(theme.palette.common.black).setAlpha(0.5).toString(),
            textTransform: 'capitalize',
            position: 'absolute',
            right: 12,
            top: 12,
        },
        tokenLabel: {
            width: 48,
            height: 48,
            position: 'absolute',
            top: 0,
            left: 0,
        },
    }
})

export interface RedPacketProps {
    payload: RedPacketJSONPayload
}

export const RedPacket = memo(function RedPacket({ payload }: RedPacketProps) {
    const t = useRedPacketTrans()
    const token = payload.token
    const { pluginID } = useNetworkContext()
    const payloadChainId = token?.chainId ?? EVMChainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payloadChainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })

    // #region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
        claimStrategyStatus,
        recheckClaimStatus,
        checkingClaimStatus,
    } = useAvailabilityComputed(account ?? payload.contract_address, payload)

    // #endregion

    const { canClaim, canRefund, listOfStatus } = availabilityComputed

    // #region remote controlled transaction dialog
    const postLink = usePostLink()

    const signedMsg = useSignedMessage(account, payload)
    const [{ loading: isClaiming, value: claimTxHash }, claimCallback] = useClaimCallback(
        payload.contract_version,
        account,
        payload.rpid,
        signedMsg,
        payloadChainId,
    )

    // TODO payload.chainId is undefined on production mode
    const network = useNetwork(pluginID, payload.chainId || payload.token?.chainId)
    const shareText = useMemo(() => {
        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const shareTextOption = {
            sender: payload.sender.name,
            payload: postLink.toString(),
            network: network?.name ?? 'Mainnet',
            account: isOnTwitter ? t.twitter_account() : t.facebook_account(),
            interpolation: { escapeValue: false },
        }
        if (listOfStatus.includes(RedPacketStatus.claimed) || claimTxHash) {
            return isOnTwitter || isOnFacebook ?
                    t.share_message_official_account(shareTextOption)
                :   t.share_message_not_twitter(shareTextOption)
        }

        return isOnTwitter || isOnFacebook ?
                t.share_unclaimed_message_official_account(shareTextOption)
            :   t.share_unclaimed_message_not_twitter(shareTextOption)
    }, [payload, postLink, claimTxHash, listOfStatus, t, network?.name])

    const [{ loading: isRefunding }, _isRefunded, refundCallback] = useRefundCallback(
        payload.contract_version,
        account,
        payload.rpid,
        payloadChainId,
    )

    const redPacketContract = useRedPacketContract(payloadChainId, payload.contract_version) as HappyRedPacketV4
    const checkResult = useCallback(async () => {
        const data = await redPacketContract.methods.check_availability(payload.rpid).call({
            // check availability is ok w/o account
            from: account,
        })
        if (isZero(data.claimed_amount)) return
        TransactionConfirmModal.open({
            shareText,
            amount: formatBalance(data.claimed_amount, token?.decimals, { significant: 2 }),
            token,
            tokenType: TokenType.Fungible,
            messageTextForNFT: t.claim_nft_successful({
                name: 'NFT',
            }),
            messageTextForFT: t.claim_token_successful({
                amount: formatBalance(data.claimed_amount, token?.decimals, { significant: 2 }),
                name: `$${token?.symbol}`,
            }),
            title: t.lucky_drop(),
            share,
        })
    }, [token, redPacketContract, payload.rpid, account])

    const [showRequirements, setShowRequirements] = useState(false)
    const onClaimOrRefund = useCallback(async () => {
        let hash: string | undefined
        const result = await recheckClaimStatus()
        if (result === false) {
            setShowRequirements(true)
            return
        }
        if (canClaim) {
            hash = await claimCallback()
            checkResult()
        } else if (canRefund) {
            hash = await refundCallback()
        }
        if (typeof hash === 'string') {
            revalidateAvailability()
        }
    }, [canClaim, canRefund, claimCallback, recheckClaimStatus])

    const handleShare = useCallback(() => {
        if (shareText) share?.(shareText)
    }, [shareText])

    const outdated =
        listOfStatus.includes(RedPacketStatus.empty) || (!canRefund && listOfStatus.includes(RedPacketStatus.expired))

    const { classes } = useStyles({ outdated })
    const theme = useCoverTheme(payload.rpid)
    const cover = useMemo(() => {
        if (!token?.symbol || !theme) return ''
        return getRedPacketCover({
            theme,
            symbol: token.symbol,
            shares: payload.shares,
            amount: payload.total,
            decimals: token.decimals,
            from: `@${formatEthereumAddress(payload.sender.name, 4)}`,
            message: payload.sender.message,
            remainingAmount: payload.total_remaining!,
            remainingShares: minus(payload.shares, availability?.claimed || 0).toNumber(),
        })
    }, [token?.symbol, payload, availability, theme])

    // the red packet can fetch without account
    if (!availability || !token || !cover) return <LoadingStatus minHeight={148} />

    return (
        <>
            <Card
                className={classes.root}
                component="article"
                elevation={0}
                style={{
                    backgroundImage: `url("${cover}")`,
                }}>
                <img className={classes.cover} src={cover} />
                <img
                    src={new URL('../assets/tokenLabel.png', import.meta.url).toString()}
                    className={classes.tokenLabel}
                />
                <div className={classes.header}>
                    {/* it might be fontSize: 12 on twitter based on theme? */}
                    {listOfStatus.length ?
                        <Typography className={classes.label} variant="body2">
                            {resolveRedPacketStatus(listOfStatus)}
                        </Typography>
                    :   null}
                </div>
                <Grow in={showRequirements && !checkingClaimStatus} timeout={250}>
                    <Requirements
                        statusList={claimStrategyStatus?.claimStrategyStatus ?? EMPTY_LIST}
                        className={classes.requirements}
                        onClose={() => setShowRequirements(false)}
                    />
                </Grow>
            </Card>
            {outdated ? null : (
                <OperationFooter
                    chainId={payloadChainId}
                    canClaim={canClaim || !payload.password}
                    canRefund={canRefund}
                    isClaiming={isClaiming || checkingClaimStatus}
                    isRefunding={isRefunding}
                    onShare={handleShare}
                    onClaimOrRefund={onClaimOrRefund}
                />
            )}
        </>
    )
})

function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed'
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded'
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired'
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty'
    return ''
}
