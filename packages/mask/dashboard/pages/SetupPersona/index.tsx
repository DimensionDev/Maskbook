import { Route, Routes, useMatch } from 'react-router-dom'
import { SetupFrame } from '../../components/SetupFrame/index.js'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'
import { Welcome } from './Welcome/index.js'
import { SignUp } from './SignUp/index.js'
import { SignUpMnemonic } from './Mnemonic/index.js'
import { Onboarding } from './Onboarding/index.js'
import { Recovery } from './Recovery/index.js'

const r = relativeRouteOf(DashboardRoutes.Setup)
export default function SetupPersona() {
    return (
        <SetupFrame hiddenSpline={!!useMatch(DashboardRoutes.SignUpPersonaOnboarding)}>
            <Routes>
                <Route path={r(DashboardRoutes.Welcome)} element={<Welcome />} />
                <Route path={r(DashboardRoutes.SignUpPersona)} element={<SignUp />} />
                <Route path={r(DashboardRoutes.RecoveryPersona)} element={<Recovery />} />
                <Route path={r(DashboardRoutes.SignUpPersonaMnemonic)} element={<SignUpMnemonic />} />
                <Route path={r(DashboardRoutes.SignUpPersonaOnboarding)} element={<Onboarding />} />
            </Routes>
        </SetupFrame>
    )
}
