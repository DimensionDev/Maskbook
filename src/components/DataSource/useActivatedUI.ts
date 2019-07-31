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
export const MyIdentitiesContext = React.createContext<Person | null>(null)
