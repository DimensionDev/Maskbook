import { useTimeout } from 'react-use'
import { useMyIdentity } from '../../../DataSource/useActivatedUI.js'

export function useCurrentUserId() {
    const lastRecognized = useMyIdentity()
    const currentUserId = lastRecognized.identifier?.userId
    // There is not state for getting current userId, setting a timeout for that.
    const [timeout] = useTimeout(5000)
    const [delay] = useTimeout(800)
    const fakeLoading = !delay() // Getting userId is instantly fast, add a fake loading
    const loading = timeout() ? false : fakeLoading || !currentUserId
    return [loading, fakeLoading ? undefined : currentUserId] as const
}
