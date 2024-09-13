import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { t } from '@lingui/macro'

export function RouterDialog(props: InjectedDialogProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const titleMap: Record<RoutePaths, string | null> = {
        [RoutePaths.Swap]: t`Exchange`,
        [RoutePaths.History]: t`History`,
        [RoutePaths.Confirm]: t`Confirm swap`,
        [RoutePaths.SelectLiquidity]: t`Select Liquidity`,
        [RoutePaths.Slippage]: t`Slippage`,
        [RoutePaths.QuoteRoute]: t`Quote Route`,
        [RoutePaths.TradingRoute]: t`Trading Route`,
        [RoutePaths.Exit]: null,
        [RoutePaths.NetworkFee]: t`Network fee`,
        [RoutePaths.Transaction]: t`Transaction Details`,
    }

    const title = titleMap[pathname as RoutePaths] ?? t`Exchange`

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
