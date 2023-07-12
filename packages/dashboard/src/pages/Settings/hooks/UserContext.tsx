import { createContext, type PropsWithChildren, useState, useMemo, useCallback, memo } from 'react'
import { SettingPasswordDialog } from '../components/dialogs/SettingPasswordDialog.js'
import { BackupPasswordConfirmDialog } from '../../../components/BackupPasswordConfirmDialog/index.js'

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
UserContext.displayName = 'UserContext'

export type VerifyPasswordSet = () => void
export type ConfirmPasswordCallback = () => void
export type ConfirmPasswordOption = {
    tipTitle?: string
    tipContent?: string
    confirmTitle?: string
    force?: boolean
    hasSmartPay?: boolean
    hasPaymentPassword?: boolean
}

export const UserProvider = memo(function UserProvider({ children }: PropsWithChildren<{}>) {
    const backupPassword = localStorage.getItem('backupPassword')
    const [user, setUser] = useState({
        backupPassword: backupPassword && atob(backupPassword),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
        backupMethod: localStorage.getItem('backupMethod'),
        backupAt: localStorage.getItem('backupAt'),
    })

    const [callback, setCallback] = useState<[VerifyPasswordSet] | null>(null)
    const [confirmCallback, setConfirmCallback] = useState<[ConfirmPasswordCallback] | null>(null)
    const [confirmOption, setConfirmOption] = useState<ConfirmPasswordOption>()

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

    const ensurePasswordSet = useCallback(
        (f: VerifyPasswordSet) => {
            if (user.backupPassword) f()
            else setCallback([f])
        },
        [user.backupPassword],
    )

    const confirmPassword = useCallback(
        (f: ConfirmPasswordCallback, option?: ConfirmPasswordOption) => {
            const { force = true } = option ?? {}

            if (!force && !user.backupPassword && !option?.hasSmartPay) {
                f()
            } else {
                setConfirmCallback([f])
                setConfirmOption(option)
            }
        },
        [user.backupPassword],
    )

    const onSet = () => {
        callback?.[0]?.()
    }

    const onConfirmed = () => {
        confirmCallback?.[0]?.()
        setConfirmCallback(null)
    }

    const userContext = useMemo(
        () => ({
            user,
            updateUser,
            ensurePasswordSet,
            confirmPassword,
        }),
        [user, ensurePasswordSet, confirmPassword],
    )
    return (
        <UserContext.Provider value={userContext}>
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
})
