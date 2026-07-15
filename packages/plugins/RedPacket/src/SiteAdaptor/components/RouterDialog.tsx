import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { useLayoutEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { HistoryTabs, type RedPacketTabs } from '../../types.js'

export function RouterDialog({
    pageMap,
    ...props
}: InjectedDialogProps & { pageMap: Record<RedPacketTabs, RoutePaths> }) {
    const { pathname } = useLocation()
    const navigate = useNavigate()

    useLayoutEffect(() => {
        if (pathname !== RoutePaths.Exit) return
        props.onClose?.()
    }, [pathname === RoutePaths.Exit, props.onClose])

    const titleMap: { [property: string]: ReactNode } = {
        [RoutePaths.ConfirmTokenRedPacket]: <Trans>Confirm the Lucky Drop</Trans>,
        [RoutePaths.History]: <Trans>History</Trans>,
        [RoutePaths.HistoryDetail]: <Trans>Claim Details</Trans>,
        [RoutePaths.CustomCover]: <Trans>Add a Custom Cover</Trans>,
    }
    const titleTailMap: { [property: string]: ReactNode } = {
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
            titleTail={titleTailMap[pathname] || null}
            onClose={() => {
                navigate(-1)
            }}
        />
    )
}
