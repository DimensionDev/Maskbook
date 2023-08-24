import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'

export interface User {
    backupPassword: string | null
    email: string | null
    phone: string | null
    backupMethod: string | null
    backupAt: string | null
}

function useUserContext() {
    const backupPassword = localStorage.getItem('backupPassword')
    const [user, setUser] = useState({
        backupPassword: backupPassword && atob(backupPassword),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
        backupMethod: localStorage.getItem('backupMethod'),
        backupAt: localStorage.getItem('backupAt'),
    })

    const updateUser = useCallback((obj: Partial<User>) => {
        setUser((old) => {
            const updated = { ...old, ...obj }
            localStorage.setItem('backupPassword', btoa(updated.backupPassword ?? ''))
            localStorage.setItem('email', updated.email || '')
            localStorage.setItem('phone', updated.phone || '')
            localStorage.setItem('backupMethod', updated.backupMethod || '')
            localStorage.setItem('backupAt', updated.backupAt || '')
            return updated
        })
    }, [])

    return {
        user,
        updateUser,
    }
}

export const UserContext = createContainer(useUserContext)
