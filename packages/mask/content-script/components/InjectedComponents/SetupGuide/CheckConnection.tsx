import type { BindingDialogProps } from '@masknet/shared'
import { AccountConnectStatus } from './AccountConnectStatus.js'
import { SetupGuideContext } from './SetupGuideContext.js'

export function CheckConnection({ onClose }: BindingDialogProps) {
    const { userId, loadingCurrentUserId, currentUserId } = SetupGuideContext.useContainer()

    return (
        <AccountConnectStatus
            expectAccount={userId}
            currentUserId={currentUserId}
            loading={loadingCurrentUserId}
            onClose={onClose}
        />
    )
}
