import { Icons } from '@masknet/icons'
import { RoutePaths, useTrade } from '@masknet/plugin-trader'
import { PopupRoutes } from '@masknet/shared-base'
import { MaskTabList } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Tab } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { NormalHeader } from '../../components/index.js'

export function Header() {
    const { mode } = useTrade()
    const basepath = '/trader'
    const titleMap: Record<RoutePaths, string | null> = {
        [RoutePaths.Trade]: 'Exchange',
        [RoutePaths.History]: 'History',
        [RoutePaths.Confirm]: 'Confirm Swap',
        [RoutePaths.BridgeConfirm]: 'Confirm Bridge',
        [RoutePaths.SelectLiquidity]: 'Select Liquidity',
        [RoutePaths.Slippage]: 'Slippage',
        [RoutePaths.QuoteRoute]: 'Quote Route',
        [RoutePaths.BridgeQuoteRoute]: 'Quote Route',
        [RoutePaths.TradingRoute]: 'Trading Route',
        [RoutePaths.Exit]: null,
        [RoutePaths.NetworkFee]: 'Network fee',
        [RoutePaths.Transaction]: 'Transaction Details',
    }
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const match = pathname === PopupRoutes.Trader || pathname === `${PopupRoutes.Trader}${RoutePaths.Trade}`
    const title = (pathname.startsWith('/trader') ? pathname.slice('/trader'.length) : pathname) as RoutePaths

    return (
        <TabContext value={mode}>
            <NormalHeader
                title={titleMap[title] || 'Exchange'}
                extension={
                    match ?
                        <Icons.History
                            size={24}
                            onClick={() => {
                                navigate(basepath + RoutePaths.History)
                            }}
                        />
                    :   null
                }
                tabList={
                    match ?
                        <MaskTabList
                            variant="base"
                            onChange={(_, tab) => {
                                navigate(
                                    {
                                        pathname: `${PopupRoutes.Trader}${RoutePaths.Trade}`,
                                        search: `?mode=${tab}`,
                                    },
                                    { replace: true },
                                )
                            }}>
                            <Tab label="Swap" value="swap" />
                            <Tab label="Bridge" value="bridge" />
                        </MaskTabList>
                    :   null
                }
            />
        </TabContext>
    )
}
