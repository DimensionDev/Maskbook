import { createContext, useState, PropsWithChildren } from 'react'
import SettingPasswordDialog from '../components/dialogs/SettingPasswordDialog'

export interface User {
    backupPassword: string | null
    email: string | null
    phone: string | null
    backupMethod: string | null
    backupAt: string | null
}

export interface UserContext {
    user: User
    updateUser: (user: Partial<User>) => void
    ensurePasswordSet: (onSet: VerifyPasswordSet) => void
}

export const UserContext = createContext<UserContext>({
    user: {
        backupPassword: '',
        email: '',
        phone: '',
        backupMethod: '',
        backupAt: '',
    },
    updateUser: () => {
        throw new Error('Context not provided.')
    },
    ensurePasswordSet: () => {
        throw new Error('Context not provided.')
    },
})

export type VerifyPasswordSet = () => void

export function UserProvider({ children }: PropsWithChildren<{}>) {
    const [user, setUser] = useState({
        backupPassword: localStorage.getItem('backupPassword'),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
        backupMethod: localStorage.getItem('backupMethod'),
        backupAt: localStorage.getItem('backupAt'),
    })

    const [callback, setCallback] = useState<[VerifyPasswordSet] | null>(null)

    const updateUser = (obj: Partial<User>) => {
        const updated = { ...user, ...obj }
        setUser(updated)
        localStorage.setItem('backupPassword', updated.backupPassword || '')
        localStorage.setItem('email', updated.email || '')
        localStorage.setItem('phone', updated.phone || '')
        localStorage.setItem('backupMethod', updated.backupMethod || '')
        localStorage.setItem('backupAt', updated.backupAt || '')
    }

    const ensurePasswordSet = (f: VerifyPasswordSet) => {
        if (user.backupPassword) f()
        else setCallback([f])
    }

    const onSet = () => {
        callback?.[0]?.()
    }

    return (
        <UserContext.Provider value={{ user, updateUser, ensurePasswordSet }}>
            {children}
            <SettingPasswordDialog open={!!callback} onSet={onSet} onClose={() => setCallback(null)} />
        </UserContext.Provider>
    )
}
