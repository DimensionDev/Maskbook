import React from 'react'
import { Person } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'
export function useMyIdentities() {
    return useValueRef(getActivatedUI().myIdentitiesRef)
}
export const MyIdentityContext = React.createContext<Person | null>(null)
