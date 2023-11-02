import { AccountConnectStatus } from './AccountConnectStatus.js'
import type { BindingDialogProps } from './BindingDialog.js'
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
