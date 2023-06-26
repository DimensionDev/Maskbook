import { RowLayout } from '../../components/RegisterFrame/RowLayout.js'
import { Header } from '../../components/RegisterFrame/ColumnContentHeader.js'
import { useDashboardI18N } from '../../locales/index.js'
import { Body, ColumnContentLayout } from '../../components/RegisterFrame/ColumnContentLayout.js'
import { useNavigate, useLocation } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { Restore } from '../../components/Restore/index.js'
import { UserProvider } from '../Settings/hooks/UserContext.js'
import { useMemo } from 'react'

export default function SignIn() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const { state: _state, search } = useLocation()
    const state = _state as undefined | { from?: string }

    const from = new URLSearchParams(search).get('from')
    const isFromPopups = from === 'popups'
    const action = useMemo(() => {
        return state?.from || isFromPopups
            ? {
                  name: t.close(),
                  callback: () => (state?.from ? navigate(state.from) : navigate(DashboardRoutes.Personas)),
              }
            : {
                  name: t.sign_in_account_sign_up_button(),
                  callback: () => navigate(DashboardRoutes.SignUp),
              }
    }, [state?.from, isFromPopups])

    return (
        <UserProvider>
            <RowLayout>
                <ColumnContentLayout>
                    <Header title={t.sign_in_account_identity_title()} action={action} />
                    <Body>
                        <Restore />
                    </Body>
                </ColumnContentLayout>
            </RowLayout>
        </UserProvider>
    )
}
