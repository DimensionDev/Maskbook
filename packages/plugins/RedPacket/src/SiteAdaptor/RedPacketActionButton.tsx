import { memo, useCallback, useContext } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useMediaQuery, type Theme } from '@mui/material'
import { useRedPacketTrans } from '../locales/index.js'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { useRefundCallback } from './hooks/useRefundCallback.js'
import { openComposition } from './openComposition.js'
import { RedPacketMetaKey } from '../constants.js'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { CompositionTypeContext } from './RedPacketInjection.js'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        actionButton: {
            fontSize: 12,
            width: 88,
            height: 32,
            background: `${theme.palette.maskColor.dark} !important`,
            opacity: '1 !important',
            color: theme.palette.maskColor.white,
            borderRadius: '999px',
            minHeight: 'auto',
            [smallQuery]: {
                marginTop: theme.spacing(1),
            },
            '&:disabled': {
                background: theme.palette.maskColor.primaryMain,
                color: theme.palette.common.white,
            },
            '&:hover': {
                background: theme.palette.maskColor.dark,
                color: theme.palette.maskColor.white,
                opacity: 0.8,
            },
        },
    }
})

interface TokenInfo {
    symbol: string
    decimals: number
    amount?: string
}
const RedPacketStatus = FireflyRedPacketAPI.RedPacketStatus
interface Props {
    rpid: string
    account: string
    redpacketStatus: FireflyRedPacketAPI.RedPacketStatus
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[]
    shareFrom?: string
    themeId?: string
    tokenInfo: TokenInfo
    redpacketMsg?: string
    chainId: ChainId
    totalAmount?: string
    /** timestamp in seconds */
    createdAt?: number
    canResend?: boolean
    onResend?(): void
}

export const RedPacketActionButton = memo(function RedPacketActionButton(props: Props) {
    const {
        redpacketStatus: _redpacketStatus,
        rpid,
        account,
        claim_strategy,
        shareFrom,
        themeId,
        tokenInfo,
        redpacketMsg,
        chainId,
        totalAmount,
        createdAt,
        canResend,
        onResend,
    } = props
    const { classes } = useStyles()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const t = useRedPacketTrans()
    const compositionType = useContext(CompositionTypeContext)

    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(4, account, rpid, chainId)
    const statusToTransMap = {
        [RedPacketStatus.Send]: t.send(),
        [RedPacketStatus.Expired]: t.expired(),
        [RedPacketStatus.Empty]: t.empty(),
        [RedPacketStatus.Refund]: t.expired(),
        [RedPacketStatus.View]: canResend ? t.share() : t.view(),
        [RedPacketStatus.Refunding]: t.refund(),
    }

    const [{ loading: isSharing }, shareCallback] = useAsyncFn(async () => {
        if (!shareFrom || !themeId || !createdAt) return

        const payloadImage = await FireflyRedPacket.getPayloadUrlByThemeId(
            themeId,
            shareFrom,
            tokenInfo.amount,
            'fungible',
            tokenInfo.symbol,
            Number(tokenInfo.decimals),
        )
        openComposition(
            RedPacketMetaKey,
            {
                contract_version: 4,
                sender: {
                    address: account,
                    name: shareFrom,
                    message: redpacketMsg,
                },
                creation_time: createdAt * 1000,
                token: {
                    chainId,
                    symbol: tokenInfo.symbol,
                    decimals: tokenInfo.decimals,
                },
                contract_address: rpid,
                rpid,
                shares: totalAmount,
                total: tokenInfo.amount,
            },
            compositionType,
            { claimRequirements: claim_strategy, payloadImage },
        )
    }, [])

    const redpacketStatus = refunded ? RedPacketStatus.Refund : _redpacketStatus

    const handleClick = useCallback(async () => {
        if (canResend) onResend?.()
        else if (redpacketStatus === RedPacketStatus.Send || redpacketStatus === RedPacketStatus.View)
            await shareCallback()
        else if (redpacketStatus === RedPacketStatus.Refunding) await refundCallback()
    }, [redpacketStatus, shareCallback, refundCallback, canResend, onResend])

    return (
        <ActionButton
            loading={isRefunding || isSharing}
            fullWidth={isSmall}
            onClick={() => {
                handleClick()
            }}
            className={classes.actionButton}
            disabled={
                redpacketStatus === RedPacketStatus.Empty ||
                redpacketStatus === RedPacketStatus.Expired ||
                redpacketStatus === RedPacketStatus.Refund
            }
            size="large">
            <span>{statusToTransMap[redpacketStatus]}</span>
        </ActionButton>
    )
})
