import React from 'react'
import { Person } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'

export function useFriendsList() {
    return useValueRef(getActivatedUI().friendsRef)
}
export function useLastRecognizedIdentity() {
    return useValueRef(getActivatedUI().lastRecognizedIdentity)
}
export function useMyIdentities() {
    return useValueRef(getActivatedUI().myIdentitiesRef)
}
export function useCurrentIdentity(noDefault?: boolean): Person | null {
    const all = useMyIdentities()[0] || null
    return useValueRef(getActivatedUI().currentIdentity) || (noDefault ? null : all)
}
