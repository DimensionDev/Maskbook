import { Route, Routes } from 'react-router-dom'
import { SetupFrame } from '../../components/SetupFrame/index.js'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'
import { Welcome } from './Welcome/index.js'
import { SignUp } from './SignUp/index.js'
import { SignUpMnemonic } from './Mnemonic/index.js'

const r = relativeRouteOf(DashboardRoutes.Setup)
export default function SetupPersona() {
    return (
        <SetupFrame>
            <Routes>
                <Route path={r(DashboardRoutes.Welcome)} element={<Welcome />} />
                <Route path={r(DashboardRoutes.SignUpPersona)} element={<SignUp />} />
                <Route path={r(DashboardRoutes.SignupPersonaMnemonic)} element={<SignUpMnemonic />} />
            </Routes>
        </SetupFrame>
    )
}
