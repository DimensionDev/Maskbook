import { createContext, PropsWithChildren, useState } from 'react'
import SettingPasswordDialog from '../components/dialogs/SettingPasswordDialog'
import { BackupPasswordConfirmDialog } from '../../../components/BackupPasswordValidation'

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
    confirmPassword: (onConfirmCallback: ConfirmPasswordCallback, option?: ConfirmPasswordOption) => void
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
    confirmPassword: () => {
        throw new Error('Context not provided.')
    },
})

export type VerifyPasswordSet = () => void
export type ConfirmPasswordCallback = () => void
export type ConfirmPasswordOption = {
    tipTitle?: string
    tipContent?: string
    confirmTitle?: string
}

export function UserProvider({ children }: PropsWithChildren<{}>) {
    const [user, setUser] = useState({
        backupPassword: localStorage.getItem('backupPassword'),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
        backupMethod: localStorage.getItem('backupMethod'),
        backupAt: localStorage.getItem('backupAt'),
    })

    const [callback, setCallback] = useState<[VerifyPasswordSet] | null>(null)
    const [confirmCallback, setConfirmCallback] = useState<[ConfirmPasswordCallback] | null>(null)
    const [confirmOption, setConfirmOption] = useState<ConfirmPasswordOption>()

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

    const confirmPassword = (f: ConfirmPasswordCallback, option?: ConfirmPasswordOption) => {
        setConfirmCallback([f])
        setConfirmOption(option)
    }

    const onSet = () => {
        callback?.[0]?.()
    }

    const onConfirmed = () => {
        confirmCallback?.[0]?.()
        setConfirmCallback(null)
    }

    return (
        <UserContext.Provider value={{ user, updateUser, ensurePasswordSet, confirmPassword }}>
            {children}
            <SettingPasswordDialog open={!!callback} onSet={onSet} onClose={() => setCallback(null)} />
            {!!confirmCallback && (
                <BackupPasswordConfirmDialog
                    option={confirmOption}
                    open={!!confirmCallback}
                    onConfirmed={onConfirmed}
                    onClose={() => setConfirmCallback(null)}
                />
            )}
        </UserContext.Provider>
    )
}
