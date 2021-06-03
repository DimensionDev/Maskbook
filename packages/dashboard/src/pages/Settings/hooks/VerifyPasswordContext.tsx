import { createContext, useState, PropsWithChildren } from 'react'
import VerifyPasswordDialog from '../components/dialogs/VerifyPasswordDialog'

interface ContextState {
    verified: boolean
    verify: (opt: Option) => void
}

let ModalContext = createContext<ContextState>({
    verified: false,
    verify: () => {},
})

interface Option {
    onVerified: () => void
}

let ModalProvider = ({ children }: PropsWithChildren<{}>) => {
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
    const verify = (opt: Option) => {
        if (!verified) {
            setOpen(true)
            if (opt) setOption(opt)
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
