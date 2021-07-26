import { CreateMaskWalletFrame } from '../../components/CreateWalletFrame'
import { Routes, Route } from 'react-router-dom'
import { CreateWalletForm } from './components/CreateWalletForm'
import { CreateMnemonic } from './components/CreateMnemonic'

export default function CreateWallet() {
    return (
        <CreateMaskWalletFrame>
            <Routes>
                <Route path="/form" element={<CreateWalletForm />} />
                <Route path="/mnemonic" element={<CreateMnemonic />} />
            </Routes>
        </CreateMaskWalletFrame>
    )
}
