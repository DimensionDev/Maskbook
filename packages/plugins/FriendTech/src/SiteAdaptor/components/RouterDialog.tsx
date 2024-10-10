import { Icons } from '@masknet/icons'
import {
    ApplicationSettingTabs,
    InjectedDialog,
    useOpenApplicationSettings,
    useParamTab,
    type InjectedDialogProps,
} from '@masknet/shared'
import { PluginID } from '@masknet/shared-base'
import { MaskTabList } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { IconButton, Tab } from '@mui/material'
import { useLayoutEffect, useMemo } from 'react'
import { matchPath, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { RoutePaths, TitleTabs } from '../../constants.js'
import { Trans } from '@lingui/macro'

export function RouterDialog(props: InjectedDialogProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const paramTitle = params.get('title')

    const title = useMemo(() => {
        if (matchPath(RoutePaths.Detail, pathname)) {
            return paramTitle || <Trans>Friend</Trans>
        }
        if (matchPath(RoutePaths.Order, pathname)) return <Trans>Sell</Trans>
        return <Trans>Friend</Trans>
    }, [pathname, paramTitle])

    useLayoutEffect(() => {
        if (pathname === RoutePaths.Exit) {
            props.onClose?.()
        }
    }, [pathname === RoutePaths.Exit, props.onClose])

    const [tab, handleTabChange] = useParamTab<TitleTabs>(TitleTabs.Keys)
    const titleTabs =
        matchPath(RoutePaths.Main, pathname) ?
            <MaskTabList variant="base" onChange={handleTabChange}>
                <Tab label={<Trans>Keys</Trans>} value={TitleTabs.Keys} />
                <Tab label={<Trans>History</Trans>} value={TitleTabs.History} />
            </MaskTabList>
        :   undefined
    const openApplicationBoardDialog = useOpenApplicationSettings()

    return (
        <TabContext value={tab}>
            <InjectedDialog
                {...props}
                title={title}
                titleBarIconStyle="back"
                titleTabs={titleTabs}
                onClose={() => {
                    navigate(-1)
                }}
                titleTail={
                    <IconButton
                        size="small"
                        sx={{ margin: '-5px' }}
                        onClick={() => {
                            openApplicationBoardDialog(ApplicationSettingTabs.pluginSwitch, PluginID.FriendTech)
                        }}>
                        <Icons.Gear size={24} />
                    </IconButton>
                }
            />
        </TabContext>
    )
}
