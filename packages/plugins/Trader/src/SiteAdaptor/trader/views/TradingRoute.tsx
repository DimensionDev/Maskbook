import { t } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { EmptyStatus } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetwork } from '@masknet/web3-hooks-base'
import type { SwapToken } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { produce } from 'immer'
import { Fragment, memo, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BridgeNode } from '../../components/BridgeNode.js'
import { CoinIcon } from '../../components/CoinIcon.js'
import { useTrade } from '../contexts/index.js'
import { getBridgeLeftSideToken, getBridgeRightSideToken } from '../helpers.js'

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
        color: theme.palette.maskColor.second,
    },
    token: {
        backgroundColor: theme.palette.maskColor.bg,
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing('8px', '6px'),
        borderRadius: theme.spacing(1.5),
        gap: theme.spacing(0.5),
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    pool: {
        flexGrow: 1,
        flexBasis: 0,
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1.5),
        fontSize: 13,
        fontWeight: 400,
        color: theme.palette.maskColor.main,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    nodes: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    node: {
        flexGrow: 1,
        minWidth: 0,
        cursor: 'pointer',
    },
}))

enum BridgeStep {
    FromSide = 'from-side',
    Bridge = 'bridge',
    ToSide = 'to-side',
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

    const fromNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, fromChainId)
    const toNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, toChainId)

    const bridgeRoute =
        bridgeQuote?.routerList.find((x) => x.router.bridgeId === bridgeId) || bridgeQuote?.routerList[0]

    const [
        bridgeStep = bridgeRoute?.fromDexRouterList.length ? BridgeStep.FromSide : BridgeStep.Bridge,
        setBridgeStep,
    ] = useState<BridgeStep>()
    const { bridgeNodes, leftSideToken, rightSideToken } = useMemo(() => {
        if (isSwap || !bridgeRoute) return { bridgeNodes: EMPTY_LIST }
        const nodes: ReactNode[] = []
        let leftSideToken: SwapToken | undefined =
            fromToken ?
                {
                    chainId: fromChainId,
                    tokenContractAddress: fromToken.address,
                    tokenSymbol: fromToken.symbol,
                    decimal: fromToken.decimals.toString(),
                    decimals: fromToken.decimals,
                    tokenUnitPrice: '0',
                }
            :   undefined

        let rightSideToken: SwapToken | undefined =
            toToken ?
                {
                    chainId: toChainId,
                    tokenContractAddress: toToken.address,
                    tokenSymbol: toToken.symbol,
                    decimal: toToken.decimals.toString(),
                    decimals: toToken.decimals,
                    tokenUnitPrice: '0',
                }
            :   undefined
        if (bridgeRoute.fromDexRouterList.length) {
            nodes.push(
                <BridgeNode
                    key="from-side"
                    className={classes.node}
                    label={fromNetwork?.name}
                    chainId={fromChainId}
                    address={fromToken?.address}
                    symbol={fromToken?.symbol}
                    step={nodes.length + 1}
                    active={bridgeStep === BridgeStep.FromSide}
                    onClick={() => {
                        setBridgeStep(BridgeStep.FromSide)
                    }}
                />,
            )
            const lastFromToken = getBridgeLeftSideToken(bridgeRoute)
            if (lastFromToken) {
                leftSideToken = {
                    ...lastFromToken,
                    chainId: fromChainId,
                }
            }
        }
        nodes.push(
            <Icons.ArrowDrop key="bridge-arrow" className={classes.arrow} size={20} />,
            <BridgeNode
                key="bridge"
                className={classes.node}
                label={t`Bridge`}
                chainId={leftSideToken?.chainId || fromChainId}
                address={leftSideToken?.tokenContractAddress}
                symbol={leftSideToken?.tokenSymbol}
                step={Math.ceil(nodes.length / 2) + 1}
                active={bridgeStep === BridgeStep.Bridge}
                disableBadge
                onClick={() => {
                    setBridgeStep(BridgeStep.Bridge)
                }}
            />,
        )
        if (bridgeRoute.toDexRouterList.length) {
            nodes.push(
                <Icons.ArrowDrop key="to-side-arrow" className={classes.arrow} size={20} />,
                <BridgeNode
                    key="to-side"
                    className={classes.node}
                    label={toNetwork?.name}
                    chainId={toChainId}
                    address={toToken?.address}
                    symbol={toToken?.symbol}
                    step={Math.ceil(nodes.length / 2) + 1}
                    active={bridgeStep === BridgeStep.ToSide}
                    onClick={() => {
                        setBridgeStep(BridgeStep.ToSide)
                    }}
                />,
            )
            rightSideToken = { ...getBridgeRightSideToken(bridgeRoute), chainId: toChainId }
        }
        return { bridgeNodes: nodes, leftSideToken, rightSideToken }
    }, [isSwap, fromNetwork, fromToken, toToken, fromChainId, toChainId, bridgeStep])

    const dexRouterList = useMemo(() => {
        // Dex router list for swapping
        if (isSwap) return swapQuote?.dexRouterList

        // Dex router list for bridging
        if (bridgeStep === BridgeStep.FromSide) {
            return produce(bridgeRoute?.fromDexRouterList || EMPTY_LIST, (list) => {
                list.forEach((dexRouter) => {
                    dexRouter.subRouterList.forEach((subRouter) => {
                        subRouter.fromToken.chainId = fromChainId
                        subRouter.toToken.chainId = fromChainId
                    })
                })
            })
        } else if (bridgeStep === BridgeStep.Bridge) {
            // Fake token for bridge
            const fakeToken = {
                chainId: 0,
                decimals: 10,
                tokenContractAddress: '0x',
                tokenSymbol: '--',
            }
            return [
                {
                    router: '--BRIDGE--',
                    routerPercent: '100',
                    subRouterList: [
                        {
                            dexProtocol: [
                                {
                                    dexName: t`${fromNetwork?.name} Pool`,
                                    percent: '100',
                                },
                            ],
                            fromToken: leftSideToken,
                            toToken: fakeToken,
                        },
                        {
                            dexProtocol: [
                                {
                                    dexName: t`${toNetwork?.name} Pool`,
                                    percent: '100',
                                },
                            ],
                            fromToken: fakeToken,
                            toToken: rightSideToken,
                        },
                    ],
                },
            ]
        } else {
            return produce(bridgeRoute?.toDexRouterList || EMPTY_LIST, (list) => {
                list.forEach((dexRouter) => {
                    dexRouter.subRouterList.forEach((subRouter) => {
                        subRouter.fromToken.chainId = toChainId
                        subRouter.toToken.chainId = toChainId
                    })
                })
            })
        }
    }, [
        isSwap,
        bridgeStep,
        swapQuote?.dexRouterList,
        fromNetwork,
        toNetwork,
        fromChainId,
        toChainId,
        leftSideToken,
        rightSideToken,
    ])

    if (!quote) return <EmptyStatus />

    return (
        <div className={classes.container}>
            {mode === 'bridge' && bridgeNodes.length > 2 ?
                <div className={classes.nodes}>{bridgeNodes}</div>
            :   null}
            {dexRouterList?.map((route) => {
                const { subRouterList } = route
                const startToken = subRouterList[0].fromToken
                const endToken = subRouterList.at(-1)?.toToken
                const startPool = subRouterList[0].dexProtocol
                return (
                    <div key={route.router} className={classes.route}>
                        <Typography className={classes.token} component="div">
                            <CoinIcon
                                className={classes.tokenIcon}
                                chainId={isSwap ? fromChainId : startToken?.chainId}
                                address={startToken?.tokenContractAddress}
                            />
                            {startPool[0].percent}%
                        </Typography>
                        {subRouterList.map((subRouter, i) => {
                            return (
                                <Fragment key={i}>
                                    <Icons.ArrowDrop className={classes.arrow} size={20} />
                                    <Typography className={classes.pool}>{subRouter.dexProtocol[0].dexName}</Typography>
                                </Fragment>
                            )
                        })}
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
