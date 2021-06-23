import { createContext, useState, PropsWithChildren } from 'react'
import VerifyPasswordDialog from '../components/dialogs/VerifyPasswordDialog'

export interface PasswordVerifiedContext {
    isPasswordVerified: boolean
    ensurePasswordVerified: (onVerified: VerifyPasswordOnVerified) => void
}

export const PasswordVerifiedContext = createContext<PasswordVerifiedContext>({
    isPasswordVerified: false,
    ensurePasswordVerified: () => {
        throw new Error('Context not provided.')
    },
})

export type VerifyPasswordOnVerified = () => void

export function PasswordVerifiedProvider({ children }: PropsWithChildren<{}>) {
    const [isPasswordVerified, setVerified] = useState(false)
    // useState will call VerifyPasswordOnVerified directly. have to wrap with something
    const [callback, setCallback] = useState<[VerifyPasswordOnVerified] | null>(null)
    const onVerified = () => {
        callback?.[0]?.()
        setCallback(null)
        setVerified(true)
    }
    const onCancel = () => {
        setCallback(null)
    }
    const ensurePasswordVerified = (f: VerifyPasswordOnVerified) => {
        if (isPasswordVerified) f()
        else setCallback([f])
    }
    return (
        <PasswordVerifiedContext.Provider value={{ isPasswordVerified, ensurePasswordVerified }}>
            {children}
            <VerifyPasswordDialog open={!!callback} onVerified={onVerified} onClose={onCancel} />
        </PasswordVerifiedContext.Provider>
    )
}
