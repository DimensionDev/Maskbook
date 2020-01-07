import { useValueRef } from './useValueRef'
import { currentImmersiveSetupStatus } from '../../components/shared-settings/settings'
import { getActivatedUI } from '../../social-network/ui'

export default function useConnectingStatus() {
    const setupStatus = useValueRef(currentImmersiveSetupStatus[getActivatedUI().networkIdentifier])
    return !!setupStatus
}
