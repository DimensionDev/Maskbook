import { Trans } from '@lingui/react/macro'
import { NetworkPluginID, RedPacketMetaKey } from '@masknet/shared-base'
import { ActionButton, makeStyles, type ActionButtonProps } from '@masknet/theme'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useMediaQuery, type Theme } from '@mui/material'
import { memo, useCallback, useContext } from 'react'
import { useAsyncFn } from 'react-use'
import { CompositionTypeContext } from '../contexts/CompositionTypeContext.js'
import { useRefundCallback, useSolanaRefundCallback } from '../hooks/useRefundCallback.js'
import { openComposition } from '../openComposition.js'
import { useEnvironmentContext } from '@masknet/web3-hooks-base'

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

interface Props extends ActionButtonProps {
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

    canSend?: boolean
    onResend?(): void
}

export const RedPacketActionButton = memo(function RedPacketActionButton({
    redpacketStatus: propRedpacketStatus,
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
    canSend,
    ...rest
}: Props) {
    const { classes, cx } = useStyles()
    const { pluginID } = useEnvironmentContext()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const compositionType = useContext(CompositionTypeContext)

    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(4, account, rpid, chainId)
    const [{ loading: isSolanaRefunding }, solanaRefunded, refundSolanaCallback] = useSolanaRefundCallback(rpid)

    const statusToTransMap = {
        [FireflyRedPacketAPI.RedPacketStatus.Send]: <Trans>Send</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Expired]: <Trans>Expired</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Empty]: <Trans>Empty</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Refund]: <Trans>Expired</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.View]: canResend ? <Trans>Share</Trans> : <Trans>View</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Refunding]: <Trans>Refund</Trans>,
    }

    const [{ loading: isSharing }, shareCallback] = useAsyncFn(async () => {
        if (!shareFrom || !themeId || !createdAt) return

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
            { claimRequirements: claim_strategy },
        )
    }, [])

    const redpacketStatus = refunded || solanaRefunded ? RedPacketStatus.Refund : propRedpacketStatus

    const handleClick = useCallback(async () => {
        if (canResend) onResend?.()
        else if (redpacketStatus === RedPacketStatus.Send || redpacketStatus === RedPacketStatus.View)
            await shareCallback()
        else if (redpacketStatus === RedPacketStatus.Refunding)
            pluginID === NetworkPluginID.PLUGIN_SOLANA ? await refundSolanaCallback() : await refundCallback()
    }, [redpacketStatus, shareCallback, refundCallback, canResend, onResend, refundSolanaCallback, pluginID, canSend])

    return (
        <ActionButton
            {...rest}
            loading={isRefunding || isSolanaRefunding || isSharing}
            fullWidth={isSmall}
            onClick={handleClick}
            className={cx(classes.actionButton, rest.className)}
            disabled={
                redpacketStatus === RedPacketStatus.Empty ||
                redpacketStatus === RedPacketStatus.Expired ||
                redpacketStatus === RedPacketStatus.Refund
            }
            size="large">
            <span>
                {canSend ?
                    <Trans>Send</Trans>
                :   statusToTransMap[redpacketStatus]}
            </span>
        </ActionButton>
    )
})
