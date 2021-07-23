import { CreateMaskWalletFrame } from '../../components/CreateWalletFrame'
import { Routes, Route } from 'react-router-dom'
import { CreateWalletForm } from './components/CreateWalletForm'

export default function CreateWallet() {
    return (
        <CreateMaskWalletFrame>
            <Routes>
                <Route path="/form" element={<CreateWalletForm />} />
            </Routes>
        </CreateMaskWalletFrame>
    )
}
