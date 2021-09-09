import { Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout'

const Welcome = lazy(() => import('./components/Welcome'))
const CreateWalletForm = lazy(() => import('./components/CreateWalletForm'))
const CreateMnemonic = lazy(() => import('./components/CreateMnemonic'))

export default function CreateWallet() {
    return (
        <ColumnLayout>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/form" element={<CreateWalletForm />} />
                <Route path="/mnemonic" element={<CreateMnemonic />} />
            </Routes>
        </ColumnLayout>
    )
}
