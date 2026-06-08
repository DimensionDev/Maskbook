import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { InjectedDialog, usePageTab, useParamTab, type InjectedDialogProps } from '@masknet/shared'
import { MaskTabList } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Tab } from '@mui/material'
import { useLayoutEffect, type ReactNode } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { HistoryTabs, RedPacketTabs } from '../../types.js'

export function RouterDialog({
    pageMap,
    ...props
}: InjectedDialogProps & { pageMap: Record<RedPacketTabs, RoutePaths> }) {
    const { pathname } = useLocation()
    const navigate = useNavigate()

    useLayoutEffect(() => {
        if (!(pathname === RoutePaths.Exit)) return
        props.onClose?.()
    }, [pathname === RoutePaths.Exit, props.onClose])

    const [currentTab, onChange] = usePageTab<RedPacketTabs>(pageMap)

    const createTabs = (
        <TabContext value={currentTab}>
            <MaskTabList variant="base" onChange={onChange} aria-label="Redpacket">
                <Tab label={<Trans>Tokens</Trans>} value={RedPacketTabs.tokens} />
            </MaskTabList>
        </TabContext>
    )
    const [currentHistoryTab, onChangeHistoryTab] = useParamTab<HistoryTabs>(HistoryTabs.Claimed)
    const historyTabs = (
        <TabContext value={currentHistoryTab}>
            <MaskTabList variant="base" onChange={onChangeHistoryTab} aria-label="Redpacket">
                <Tab label={<Trans>Sent</Trans>} value={HistoryTabs.Sent} />
                <Tab label={<Trans>Claimed</Trans>} value={HistoryTabs.Claimed} />
            </MaskTabList>
        </TabContext>
    )
    const isCreate = matchPath(`${RoutePaths.Create}/*`, pathname)
    const titleTabs =
        isCreate ? createTabs
        : matchPath(RoutePaths.History, pathname) ? historyTabs
        : null
    const titleMap: Record<string, ReactNode> = {
        [RoutePaths.ConfirmTokenRedPacket]: <Trans>Confirm the Lucky Drop</Trans>,
        [RoutePaths.History]: <Trans>History</Trans>,
        [RoutePaths.HistoryDetail]: <Trans>Claim Details</Trans>,
        [RoutePaths.CustomCover]: <Trans>Add a Custom Cover</Trans>,
    }
    const titleTailMap: Record<string, ReactNode> = {
        [RoutePaths.CreateTokenRedPacket]: (
            <Icons.History
                onClick={() => navigate({ pathname: RoutePaths.History, search: `tab=${HistoryTabs.Sent}` })}
            />
        ),
        [RoutePaths.CreateSolanaRedPacket]: (
            <Icons.History
                onClick={() => navigate({ pathname: RoutePaths.History, search: `tab=${HistoryTabs.Sent}` })}
            />
        ),
    }

    return (
        <InjectedDialog
            {...props}
            title={titleMap[pathname] || <Trans>Lucky Drop</Trans>}
            titleTabs={titleTabs}
            titleTail={titleTailMap[pathname] || null}
            onClose={() => {
                navigate(-1)
            }}
        />
    )
}
