import type { IdentityResolved } from "../types.js"
import { useLastRecognizedIdentity } from "./useLastRecognizedIdentity.js"

export function useIsOwnerIdentity(identity: IdentityResolved | null | undefined) {
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const lastRecognizedUserId = lastRecognizedIdentity?.identifier?.userId
    const currentVisitingUserId = identity?.identifier?.userId

    if (!lastRecognizedUserId || !currentVisitingUserId) return false
    return lastRecognizedUserId.toLowerCase() === currentVisitingUserId.toLowerCase()
}