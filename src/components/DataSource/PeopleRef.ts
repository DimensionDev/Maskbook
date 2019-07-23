import React from 'react'
import { Person } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../social-network/ui'

export function usePeople() {
    return useValueRef(getActivatedUI().friendsRef)
}

export const MyIdentityContext = React.createContext<Person | null>(null)
