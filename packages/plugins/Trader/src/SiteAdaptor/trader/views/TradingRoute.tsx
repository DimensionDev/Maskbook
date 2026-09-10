import { Icons } from '@masknet/icons'
import { EmptyStatus } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { DexRouter, SwapToken } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CoinIcon } from '../../components/CoinIcon.js'
import { useTrade } from '../contexts/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(2),
        boxSizing: 'border-box',
        gap: theme.spacing(3),
    },
    route: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    arrow: {
        transform: 'rotate(-90deg)',
        color: theme.vars.palette.maskColor.second,
    },
    token: {
        backgroundColor: theme.vars.palette.maskColor.bg,
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing('8px', '6px'),
        borderRadius: theme.spacing(1.5),
        gap: theme.spacing(0.5),
        fontSize: 14,
        fontWeight: 700,
        color: theme.vars.palette.maskColor.main,
    },
    pool: {
        flexGrow: 1,
        flexBasis: 0,
        backgroundColor: theme.vars.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        fontSize: 13,
        fontWeight: 400,
        color: theme.vars.palette.maskColor.main,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
}))

function toSwapToken(token: Web3Helper.FungibleTokenAll | undefined, chainId: ChainId): SwapToken | undefined {
    if (!token) return undefined
    return {
        chainId,
        tokenContractAddress: token.address,
        tokenSymbol: token.symbol,
        decimal: token.decimals.toString(),
        decimals: token.decimals,
        tokenUnitPrice: '0',
    }
}

export const TradingRoute = memo(function TradingRoute() {
    const { classes } = useStyles()
    const { quote: swapQuote, bridgeQuote, fromToken, toToken, mode } = useTrade()
    const isSwap = mode === 'swap'
    const [params] = useSearchParams()
    const quote = isSwap ? swapQuote : bridgeQuote
    const rawBridgeId = params.get('router-bridge-id')
    const bridgeId = rawBridgeId ? +rawBridgeId : undefined

    const fromChainId = fromToken?.chainId as ChainId
    const toChainId = toToken?.chainId as ChainId

    const bridgeRoute = bridgeQuote?.routerList.find((x) => x.bridgeId === bridgeId) || bridgeQuote?.routerList[0]

    const dexRouterList = useMemo(() => {
        // Dex router list for swapping
        if (isSwap) return swapQuote?.dexRouterList

        // The v6 bridge quote API no longer exposes dex route details, show the bridge as a single hop
        const fromRouteToken = toSwapToken(fromToken, fromChainId)
        const toRouteToken = toSwapToken(toToken, toChainId)
        if (!bridgeRoute || !fromRouteToken || !toRouteToken) return
        const bridgeRoute_: DexRouter = {
            dexProtocol: {
                dexName: bridgeRoute.bridgeName,
                percent: '100',
            },
            fromToken: fromRouteToken,
            toToken: toRouteToken,
            fromTokenIndex: '0',
            toTokenIndex: '1',
        }
        return [bridgeRoute_]
    }, [isSwap, swapQuote, bridgeRoute, fromToken, toToken, fromChainId, toChainId])

    if (!quote) return <EmptyStatus />

    return (
        <div className={classes.container}>
            {dexRouterList?.map((route, index) => {
                const startToken = route.fromToken
                const endToken = route.toToken
                return (
                    <div key={index} className={classes.route}>
                        <Typography className={classes.token} component="div">
                            <CoinIcon
                                className={classes.tokenIcon}
                                chainId={isSwap ? fromChainId : startToken?.chainId}
                                address={startToken?.tokenContractAddress}
                            />
                            {route.dexProtocol.percent}%
                        </Typography>
                        <Icons.ArrowDrop className={classes.arrow} size={20} />
                        <Typography className={classes.pool}>{route.dexProtocol.dexName}</Typography>
                        <Icons.ArrowDrop className={classes.arrow} size={20} />
                        <div className={classes.token}>
                            <CoinIcon
                                className={classes.tokenIcon}
                                chainId={isSwap ? fromChainId : endToken?.chainId}
                                address={endToken?.tokenContractAddress}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
})
