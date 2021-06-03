import { createContext, useState, PropsWithChildren } from 'react'
import VerifyPasswordDialog from '../components/dialogs/VerifyPasswordDialog'

interface ContextState {
    verified: boolean
    verify: () => void
}

let ModalContext = createContext<ContextState>({
    verified: false,
    verify: () => {},
})

let ModalProvider = ({ children }: PropsWithChildren<{}>) => {
    const [open, setOpen] = useState(false)
    const [verified, setVerified] = useState(false)
    const handleVerifiled = () => {
        setOpen(false)
        setVerified(true)
    }
    const handleClose = () => {
        setOpen(false)
    }
    const verify = () => {
        if (!verified) {
            setOpen(true)
        }
    }
    return (
        <ModalContext.Provider value={{ verified, verify }}>
            {children}
            <VerifyPasswordDialog open={open} onVerified={handleVerifiled} onClose={handleClose} />
        </ModalContext.Provider>
    )
}

export { ModalContext, ModalProvider }
