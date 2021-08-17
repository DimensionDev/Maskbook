import { createContext, useState, PropsWithChildren } from 'react'

export interface User {
    backupPassword: string | null
    email: string | null
    phone: string | null
}

export interface UserContext {
    user: User
    updateUser: (user: Partial<User>) => void
}

export const UserContext = createContext<UserContext>({
    user: {
        backupPassword: '',
        email: '',
        phone: '',
    },
    updateUser: () => {
        throw new Error('Context not provided.')
    },
})

export function UserProvider({ children }: PropsWithChildren<{}>) {
    const [user, setUser] = useState({
        backupPassword: localStorage.getItem('backupPassword'),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
    })

    const updateUser = (obj: Partial<User>) => {
        const updated = { ...user, ...obj }
        setUser(updated)
        localStorage.setItem('backupPassword', updated.backupPassword || '')
        localStorage.setItem('email', updated.email || '')
        localStorage.setItem('phone', updated.phone || '')
    }

    return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>
}
