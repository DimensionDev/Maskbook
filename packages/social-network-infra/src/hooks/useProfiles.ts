import { useValueRef } from '@masknet/shared-base-ui'
import { useGlobalState } from './useContext.js'

export function useProfiles() {
    const globalState = useGlobalState()
    return useValueRef(globalState.profiles)
}
