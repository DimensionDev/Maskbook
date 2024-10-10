import { memo, useCallback, useState, useContext } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useMediaQuery, type Theme } from '@mui/material'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { useRefundCallback } from './hooks/useRefundCallback.js'
import { openComposition } from './openComposition.js'
import { RedPacketMetaKey } from '../constants.js'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { CompositionTypeContext } from './RedPacketInjection.js'
import { Trans } from '@lingui/macro'

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
    createdAt?: number
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
    } = props
    const [updatedStatus, setUpdatedStatus] = useState<FireflyRedPacketAPI.RedPacketStatus>()
    const { classes, cx } = useStyles()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const compositionType = useContext(CompositionTypeContext)

    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(4, account, rpid, chainId)
    const statusToTransMap = {
        [FireflyRedPacketAPI.RedPacketStatus.Send]: <Trans>Send</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Expired]: <Trans>Expired</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Empty]: <Trans>Empty</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Refund]: <Trans>Expired</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.View]: <Trans>View</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Refunding]: <Trans>Refund</Trans>,
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

    const redpacketStatus = updatedStatus || _redpacketStatus

    const handleClick = useCallback(async () => {
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Send) await shareCallback()
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refunding) await refundCallback()
    }, [redpacketStatus, shareCallback, refundCallback])

    if (refunded && updatedStatus !== FireflyRedPacketAPI.RedPacketStatus.Refund)
        setUpdatedStatus(FireflyRedPacketAPI.RedPacketStatus.Refund)

    return (
        <ActionButton
            loading={isRefunding || isSharing}
            fullWidth={isSmall}
            onClick={() => {
                handleClick()
            }}
            className={cx(classes.actionButton)}
            disabled={
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Empty ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Expired ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refund
            }
            size="large">
            <span>{statusToTransMap[redpacketStatus]}</span>
        </ActionButton>
    )
})
