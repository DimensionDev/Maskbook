import { useEffect, useState } from 'react'
import type { User } from '@onflow/fcl'
import { useFCL } from './'

export function useCurrentUser() {
    const fcl = useFCL()
    const [user, setUser] = useState<User | null>()

    useEffect(() => fcl.currentUser().subscribe(setUser), [])

    return user
}
