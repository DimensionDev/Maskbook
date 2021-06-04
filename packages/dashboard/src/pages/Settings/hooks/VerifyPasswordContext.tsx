import { createContext, useState, PropsWithChildren } from 'react'
import VerifyPasswordDialog from '../components/dialogs/VerifyPasswordDialog'

export interface PasswordVerifiedContext {
    isPasswordVerified: boolean
    requestVerifyPassword: (options: VerifyPasswordOption) => void
}

export const PasswordVerifiedContext = createContext<PasswordVerifiedContext>({
    isPasswordVerified: false,
    requestVerifyPassword: () => {
        throw new Error('Context not provided.')
    },
})

export interface VerifyPasswordOption {
    onVerified: () => void
}

export function PasswordVerifiedProvider({ children }: PropsWithChildren<{}>) {
    const [open, setOpen] = useState(false)
    const [verified, setVerified] = useState(false)
    const [option, setOption] = useState({ onVerified: () => {} })
    const handleVerifiled = () => {
        setOpen(false)
        setVerified(true)
        option?.onVerified && option.onVerified()
    }
    const handleClose = () => {
        setOpen(false)
    }
    const verify = (opt: VerifyPasswordOption) => {
        if (!verified) {
            setOpen(true)
            if (opt) setOption(opt)
        }
    }
    return (
        <PasswordVerifiedContext.Provider value={{ isPasswordVerified: verified, requestVerifyPassword: verify }}>
            {children}
            <VerifyPasswordDialog open={open} onVerified={handleVerifiled} onClose={handleClose} />
        </PasswordVerifiedContext.Provider>
    )
}
