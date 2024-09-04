import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTraderTrans } from '../../locales/i18n_generated.js'
import { RoutePaths } from '../constants.js'

export function RouterDialog(props: InjectedDialogProps) {
    const t = useTraderTrans()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const titleMap: Record<RoutePaths, string | null> = {
        [RoutePaths.Swap]: t.exchange(),
        [RoutePaths.History]: t.history(),
        [RoutePaths.Confirm]: t.confirm_swap(),
        [RoutePaths.SelectLiquidity]: t.select_liquidity(),
        [RoutePaths.Slippage]: t.slippage(),
        [RoutePaths.QuoteRoute]: t.quote_route(),
        [RoutePaths.TradingRoute]: t.trading_route(),
        [RoutePaths.Exit]: null,
    }

    const title = titleMap[pathname as RoutePaths] ?? t.exchange()

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) {
            props.onClose?.()
        }
    }, [pathname === RoutePaths.Exit, props.onClose])

    return (
        <InjectedDialog
            {...props}
            title={title}
            onClose={() => {
                navigate(-1)
            }}
        />
    )
}
