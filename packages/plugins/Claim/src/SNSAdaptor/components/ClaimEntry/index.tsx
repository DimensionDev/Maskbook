import { memo, useCallback } from 'react'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { Trans } from 'react-i18next'
import { PluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginClaimMessage } from '../../../message.js'

export interface ClaimEntryProps {
    disabled: boolean
    tooltipHint?: string
    onClick?: (walletConnectedCallback?: () => void) => void
    popperBoundary?: HTMLElement | null
}

export const ClaimEntry = memo<ClaimEntryProps>((props) => {
    const { setDialog } = useRemoteControlledDialog(PluginClaimMessage.claimDialogEvent)
    const handleClick = useCallback(() => {
        setDialog({
            open: true,
        })
    }, [setDialog])

    return (
        <ApplicationEntry
            {...props}
            icon={<Icons.MarketsClaim size={36} />}
            title={<Trans ns={PluginID.Claim} i18nKey="__plugin_name" />}
            onClick={() => (props.onClick ? props.onClick(handleClick) : handleClick())}
        />
    )
})
