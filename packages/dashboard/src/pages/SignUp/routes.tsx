import { Route, Routes, useParams } from 'react-router'
import { ConnectSocialMedia, MnemonicRevealForm, PersonaCreate } from './steps'
import { SignUpRoutePath } from './routePath'

const Actions = () => {
    const { action } = useParams() as { action: string }

    switch (action) {
        case SignUpRoutePath.MnemonicReveal:
            return <MnemonicRevealForm />
        case SignUpRoutePath.PersonaCreate:
            return <PersonaCreate />
        case SignUpRoutePath.ConnectSocialMedia:
            return <ConnectSocialMedia />
        default:
            return <MnemonicRevealForm />
    }
}

export const SignUpRoutes = () => {
    return (
        <Routes>
            <Route path=":action" element={<Actions />} />
            <Route path="*" element={<MnemonicRevealForm />} />
        </Routes>
    )
}
