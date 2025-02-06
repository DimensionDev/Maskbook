import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { openWindow, useEverSeen } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import {
    useChainContext,
    useEnvironmentContext,
    useFungibleToken,
    useNetworkDescriptor,
} from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, SolanaExplorerResolver } from '@masknet/web3-providers'
import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { TokenType } from '@masknet/web3-shared-base'
import {
    ChainId,
    isNativeTokenAddress,
    NETWORK_DESCRIPTORS,
    SchemaType,
    useRedPacketConstant,
} from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { skipToken, useQuery } from '@tanstack/react-query'
import { format, fromUnixTime } from 'date-fns'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { RedPacketRPC } from '../../messages.js'
import type { HistoryInfo } from '../../types.js'
import { formatTokenAmount } from '../helpers/formatTokenAmount.js'
import { useCreateRedPacketReceipt } from '../hooks/useCreateRedPacketReceipt.js'
import { RedPacketActionButton } from './RedPacketActionButton.js'

const DEFAULT_BACKGROUND = NETWORK_DESCRIPTORS.find((x) => x.chainId === ChainId.Mainnet)!.backgroundGradient!
const useStyles = makeStyles<{ background?: string; backgroundIcon?: string }>()((
    theme,
    { background, backgroundIcon },
) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        container: {
            borderRadius: 8,
            position: 'relative',
            height: 'auto !important',
            padding: theme.spacing(1.5),
            background: background || DEFAULT_BACKGROUND,
            display: 'flex',
            gap: theme.spacing(1),
            [smallQuery]: {
                padding: theme.spacing(2, 1.5),
            },
            backgroundColor: '#fff',
            '&:before': {
                pointerEvents: 'none',
                position: 'absolute',
                content: '""',
                bottom: 0,
                left: 400,
                zIndex: 0,
                width: 114,
                opacity: 0.2,
                height: 61,
                filter: 'blur(1.5px)',
                background: backgroundIcon,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '114px 114px',
            },
            '&:last-child': {
                marginBottom: '80px',
            },
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minWidth: 0,
        },
        header: {
            display: 'flex',
            gap: 10,
        },
        status: {},
        total: {
            color: theme.palette.maskColor.main,
            fontSize: 20,
            fontWeight: 700,
            lineHeight: '24px',
        },
        progress: {
            color: theme.palette.maskColor.second,
            display: 'flex',
            whiteSpace: 'nowrap',
            gap: theme.spacing(1),
            '&>b': {
                color: theme.palette.maskColor.main,
            },
        },
        symbol: {
            maxWidth: '6ch',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        message: {
            color: theme.palette.maskColor.main,
            fontWeight: 700,
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            [smallQuery]: {
                whiteSpace: 'normal',
            },
        },
        datetime: {
            color: theme.palette.maskColor.main,
            position: 'absolute',
            right: theme.spacing(1.5),
            top: theme.spacing(1.5),
            fontSize: 14,
            fontWeight: 400,
        },
        details: {
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
        },
        actionButton: {
            marginTop: theme.spacing(4),
        },
        viewButton: {
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

interface RedPacketRecordProps {
    history: HistoryInfo
    showDetailLink?: boolean
    onlyView?: boolean
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export const RedPacketRecord = memo(function RedPacketRecord({
    history,
    showDetailLink = true,
    onlyView = false,
    onSelect,
}: RedPacketRecordProps) {
    const {
        rp_msg,
        create_time,
        received_time,
        claim_numbers,
        total_numbers,
        total_amounts,
        token_decimal,
        claim_amounts,
        token_symbol,
        token_logo,
        redpacket_id,
        redpacket_status,
        claim_strategy,
        share_from,
        theme_id,
    } = history
    const navigate = useNavigate()
    const [seen, redpacketRef] = useEverSeen()
    const chainId = history.chain_id

    const { account } = useChainContext()
    const { pluginID } = useEnvironmentContext()
    const networkDescriptor = useNetworkDescriptor(pluginID, chainId)

    const { classes, cx } = useStyles({
        background: networkDescriptor?.backgroundGradient,
        backgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })

    const tokenSymbol = token_symbol
    const contractAddress = useRedPacketConstant(chainId, 'HAPPY_RED_PACKET_ADDRESS_V4')
    const { data: redpacketRecord } = useQuery({
        queryKey: ['redpacket', 'by-tx-hash', pluginID, history.trans_hash],
        queryFn:
            history.trans_hash ?
                () =>
                    RedPacketRPC.getRedPacketRecord(
                        pluginID === NetworkPluginID.PLUGIN_SOLANA ? history.redpacket_id : history.trans_hash!,
                    )
            :   skipToken,
    })
    const { data: createSuccessResult } = useCreateRedPacketReceipt(
        pluginID === NetworkPluginID.PLUGIN_SOLANA ? history.redpacket_id : (history.trans_hash ?? ''),
        chainId,
        seen,
    )

    // Only concern about MATIC token which has been renamed to POL
    const { data: token } = useFungibleToken(pluginID, createSuccessResult?.token_address, undefined, { chainId })

    const isViewStatus = redpacket_status === FireflyRedPacketAPI.RedPacketStatus.View
    const canResend = isViewStatus && !!redpacketRecord && !!createSuccessResult
    // TODO: remove this after the Solana redpacket is integrated into the backend.
    const canSend = !!isViewStatus && pluginID === NetworkPluginID.PLUGIN_SOLANA && !!redpacketRecord
    const timestamp = create_time || (received_time ? +received_time : undefined)

    // Claimed amount or total amount of the red packet
    const amount = onlyView ? history.token_amounts : history.total_amounts

    const handleResend = useCallback(() => {
        if (canSend && redpacketRecord.payload) {
            onSelect?.(redpacketRecord.payload)
        } else {
            if (!canResend) return
            onSelect?.({
                txid: history.trans_hash,
                contract_address: contractAddress!,
                rpid: history.redpacket_id,
                shares: history.total_numbers ? +history.total_numbers : 1,
                is_random: createSuccessResult.ifrandom,
                creation_time: history.create_time!,
                contract_version: 4,
                sender: {
                    address: account,
                    name: createSuccessResult.name,
                    message: createSuccessResult.message,
                },
                total: history.total_amounts ?? '0',
                duration: +createSuccessResult.duration,
                token: {
                    type: TokenType.Fungible,
                    schema:
                        isNativeTokenAddress(createSuccessResult.token_address) ? SchemaType.Native : SchemaType.ERC20,
                    id: createSuccessResult.token_address,
                    chainId: history.chain_id,
                    address: createSuccessResult.token_address,
                    symbol: history.token_symbol,
                    decimals: history.token_decimal,
                    name: history.token_symbol,
                },
                password: redpacketRecord.password,
            })
        }
    }, [canResend, redpacketRecord, onSelect, account, createSuccessResult, history, contractAddress])

    return (
        <section className={classes.container} ref={redpacketRef}>
            <div className={classes.content}>
                <div className={classes.header}>
                    <TokenIcon
                        size={36}
                        badgeSize={16}
                        chainId={chainId}
                        address={token?.address ?? createSuccessResult?.token_address}
                        logoURL={token_logo !== 'missing.png' ? token_logo : undefined}
                        symbol={token_symbol}
                        name={token_symbol}
                        disableBadge={pluginID === NetworkPluginID.PLUGIN_SOLANA}
                    />
                    <div className={classes.status}>
                        <Typography className={classes.total}>
                            {formatTokenAmount(amount || 0, token_decimal, false)} {tokenSymbol ?? token_symbol ?? '--'}
                        </Typography>
                        <Typography className={classes.progress} component="div">
                            {!onlyView ?
                                <Trans>
                                    Claimed:{' '}
                                    <b>
                                        {claim_numbers}/{total_numbers}
                                    </b>{' '}
                                    <b>
                                        {formatTokenAmount(claim_amounts || 0, token_decimal, false)}/
                                        {formatTokenAmount(total_amounts || 0, token_decimal, false)}
                                    </b>
                                    <TextOverflowTooltip title={token_symbol} as={ShadowRootTooltip}>
                                        <span className={classes.symbol}>{tokenSymbol}</span>
                                    </TextOverflowTooltip>
                                </Trans>
                            :   null}
                            {showDetailLink ?
                                <Typography
                                    component="b"
                                    className={classes.details}
                                    onClick={() => {
                                        navigate(
                                            {
                                                pathname: RoutePaths.HistoryDetail,
                                                search: `?id=${redpacket_id}&chain-id=${chainId}&claimed=${onlyView ? true : ''}`,
                                            },
                                            { state: { history } },
                                        )
                                    }}>
                                    <Trans>Details</Trans>
                                </Typography>
                            :   null}
                        </Typography>
                    </div>
                </div>
                <TextOverflowTooltip title={rp_msg || <Trans>Best Wishes!</Trans>} as={ShadowRootTooltip}>
                    <Typography className={classes.message}>{rp_msg ? rp_msg : <Trans>Best Wishes!</Trans>}</Typography>
                </TextOverflowTooltip>
            </div>
            {onlyView ?
                <ActionButton
                    className={cx(classes.viewButton, classes.actionButton)}
                    onClick={() => {
                        const link =
                            pluginID === NetworkPluginID.PLUGIN_SOLANA ?
                                SolanaExplorerResolver.transactionLink(chainId, history.trans_hash)
                            :   EVMExplorerResolver.transactionLink(chainId, history.trans_hash!)
                        openWindow(link, '_blank')
                    }}>
                    {t`View`}
                </ActionButton>
            : redpacket_status && createSuccessResult ?
                <RedPacketActionButton
                    className={classes.actionButton}
                    redpacketStatus={redpacket_status}
                    rpid={redpacket_id}
                    account={account}
                    claim_strategy={claim_strategy}
                    shareFrom={share_from}
                    themeId={theme_id}
                    redpacketMsg={rp_msg}
                    isRandom={createSuccessResult.ifrandom}
                    tokenInfo={{
                        symbol: tokenSymbol,
                        decimals: token_decimal,
                        amount: total_amounts,
                        address: createSuccessResult.token_address,
                    }}
                    history={history}
                    chainId={chainId}
                    totalAmount={total_amounts}
                    createdAt={create_time}
                    canResend={canResend}
                    canSend={canSend}
                    transactionHash={history.trans_hash}
                    onResend={handleResend}
                />
            :   null}
            {timestamp ?
                <Typography variant="body1" className={classes.datetime}>
                    <Trans>{format(fromUnixTime(timestamp), 'M/d/yyyy HH:mm')} (UTC+8)</Trans>
                </Typography>
            :   null}
        </section>
    )
})
