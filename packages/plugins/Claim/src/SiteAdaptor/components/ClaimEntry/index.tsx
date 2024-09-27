import { memo, useCallback, type ReactNode } from 'react'
import { Icons } from '@masknet/icons'
import { ApplicationEntry } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginClaimMessage } from '../../../message.js'
import { Trans } from '@lingui/macro'

interface ClaimEntryProps {
    disabled: boolean
    tooltipHint?: ReactNode
    onClick?: (walletConnectedCallback?: () => void) => void
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
            title={<Trans>Claim</Trans>}
            onClick={() => (props.onClick ? props.onClick(handleClick) : handleClick())}
        />
    )
})
