import { Trans } from '@lingui/react/macro'
import { RoutePaths } from '@masknet/plugin-redpacket'
import { ApplicationBoardModal } from '@masknet/shared'
import { NetworkPluginID, RedPacketMetaKey } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, type ActionButtonProps } from '@masknet/theme'
import { useEnvironmentContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { type ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { useMediaQuery, type Theme } from '@mui/material'
import { memo, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import type { HistoryInfo } from '../../types.js'
import { CompositionTypeContext } from '../contexts/CompositionTypeContext.js'
import { useRefundCallback, useSolanaRefundCallback } from '../hooks/useRefundCallback.js'
import { openComposition } from '../openComposition.js'

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
    address: string
}
const RedPacketStatus = FireflyRedPacketAPI.RedPacketStatus

interface Props extends ActionButtonProps {
    rpid: string
    account: string
    redpacketStatus: FireflyRedPacketAPI.RedPacketStatus
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[]
    shareFrom?: string
    themeId?: string
    isRandom: boolean
    tokenInfo: TokenInfo
    history: HistoryInfo
    redpacketMsg?: string
    chainId: ChainId | SolanaChainId
    totalAmount?: string
    /** timestamp in seconds */
    createdAt?: number
    canResend?: boolean
    transactionHash?: string
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
    isRandom,
    tokenInfo,
    history,
    redpacketMsg,
    chainId,
    totalAmount,
    createdAt,
    canResend,
    onResend,
    canSend,
    transactionHash,
    ...rest
}: Props) {
    const { classes, cx } = useStyles()
    const { pluginID } = useEnvironmentContext()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const compositionType = useContext(CompositionTypeContext)
    const Utils = useWeb3Utils()
    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(4, account, rpid, chainId as ChainId)
    const [{ loading: isSolanaRefunding }, solanaRefunded, refundSolanaCallback] = useSolanaRefundCallback({
        rpid,
        chainId: chainId as SolanaChainId,
        tokenSymbol: tokenInfo.symbol,
        tokenDecimals: tokenInfo.decimals,
    })

    const statusToTransMap = {
        [FireflyRedPacketAPI.RedPacketStatus.Send]: <Trans>Send</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Expired]: <Trans>Expired</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Empty]: <Trans>Empty</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Refund]: <Trans>Expired</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.View]: canResend ? <Trans>Share</Trans> : <Trans>View</Trans>,
        [FireflyRedPacketAPI.RedPacketStatus.Refunding]: <Trans>Refund</Trans>,
    }

    const navigate = useNavigate()
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
                    address: tokenInfo.address,
                },
                contract_address: rpid,
                rpid,
                shares: history.total_numbers ? +history.total_numbers : 5,
                total: tokenInfo.amount,
                is_random: isRandom,
                duration: history.duration,
            },
            compositionType,
            { claimRequirements: claim_strategy },
        )
        ApplicationBoardModal.close()
        navigate(RoutePaths.Exit)
    }, [
        navigate,
        account,
        shareFrom,
        themeId,
        createdAt,
        tokenInfo.amount,
        tokenInfo.address,
        compositionType,
        claim_strategy,
        rpid,
        totalAmount,
        isRandom,
        redpacketMsg,
        chainId,
    ])

    const redpacketStatus = refunded || solanaRefunded ? RedPacketStatus.Refund : propRedpacketStatus

    const handleClick = useCallback(async () => {
        if (canResend) onResend?.()
        else if (redpacketStatus === RedPacketStatus.View && transactionHash)
            openWindow(Utils.explorerResolver.transactionLink(chainId, transactionHash))
        else if (redpacketStatus === RedPacketStatus.Send) await shareCallback()
        else if (redpacketStatus === RedPacketStatus.Refunding)
            pluginID === NetworkPluginID.PLUGIN_SOLANA ? await refundSolanaCallback() : await refundCallback()
    }, [
        redpacketStatus,
        shareCallback,
        refundCallback,
        canResend,
        onResend,
        refundSolanaCallback,
        pluginID,
        canSend,
        transactionHash,
        Utils,
    ])

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
