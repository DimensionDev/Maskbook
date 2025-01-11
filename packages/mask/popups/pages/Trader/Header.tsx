import { Icons } from '@masknet/icons'
import { RoutePaths, useTrade } from '@masknet/plugin-trader'
import { PopupRoutes } from '@masknet/shared-base'
import { MaskTabList } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Tab } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { NormalHeader } from '../../components/index.js'
import { t } from '@lingui/core/macro'

export function Header() {
    const { mode } = useTrade()
    const basePath = '/trader'
    const titleMap: Record<RoutePaths, string | null> = {
        [RoutePaths.Trade]: t`Exchange`,
        [RoutePaths.History]: t`History`,
        [RoutePaths.Confirm]: t`Confirm Swap`,
        [RoutePaths.BridgeConfirm]: t`Confirm Bridge`,
        [RoutePaths.SelectLiquidity]: t`Select Liquidity`,
        [RoutePaths.Slippage]: t`Slippage`,
        [RoutePaths.QuoteRoute]: t`Quote Route`,
        [RoutePaths.BridgeQuoteRoute]: t`Quote Route`,
        [RoutePaths.TradingRoute]: t`Trading Route`,
        [RoutePaths.Exit]: null,
        [RoutePaths.NetworkFee]: t`Network fee`,
        [RoutePaths.Transaction]: t`Transaction Details`,
    }
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const match = pathname === PopupRoutes.Trader || pathname === `${PopupRoutes.Trader}${RoutePaths.Trade}`
    const title = (pathname.startsWith('/trader') ? pathname.slice('/trader'.length) : pathname) as RoutePaths

    return (
        <TabContext value={mode}>
            <NormalHeader
                title={titleMap[title] || t`Exchange`}
                extension={
                    match ?
                        <Icons.History
                            size={24}
                            onClick={() => {
                                navigate(basePath + RoutePaths.History)
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
                            <Tab label={t`Swap`} value="swap" />
                            <Tab label={t`Bridge`} value="bridge" />
                        </MaskTabList>
                    :   null
                }
            />
        </TabContext>
    )
}
