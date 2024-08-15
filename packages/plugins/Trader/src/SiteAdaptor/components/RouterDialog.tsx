import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useTraderTrans } from '../../locales/i18n_generated.js'
import { RoutePaths } from '../constants.js'

export function RouterDialog(props: InjectedDialogProps) {
    const t = useTraderTrans()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const matchHistory = matchPath(RoutePaths.History, pathname)
    const title = matchHistory ? t.history() : t.plugin_trader_tab_exchange()

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
