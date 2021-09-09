import { Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import { CreateMaskWalletFrame } from '../../components/CreateWalletFrame'

const Welcome = lazy(() => import('./components/Welcome'))
const CreateWalletForm = lazy(() => import('./components/CreateWalletForm'))
const CreateMnemonic = lazy(() => import('./components/CreateMnemonic'))

export default function CreateWallet() {
    return (
        <CreateMaskWalletFrame>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/form" element={<CreateWalletForm />} />
                <Route path="/mnemonic" element={<CreateMnemonic />} />
            </Routes>
        </CreateMaskWalletFrame>
    )
}
