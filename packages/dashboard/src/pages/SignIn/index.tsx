import { RowLayout } from '../../components/RegisterFrame/RowLayout'
import { Header } from '../../components/RegisterFrame/ColumnContentHeader'
import { useDashboardI18N } from '../../locales'
import { Body, ColumnContentLayout } from '../../components/RegisterFrame/ColumnContentLayout'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { Restore } from '../../components/Restore'
import { UserProvider } from '../Settings/hooks/UserContext'
import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import type { Search } from 'history'

export default function SignIn() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const { state, search } = useLocation() as { state: { from: string }; search: Search }

    const from = new URLSearchParams(search).get('from')

    const action = useMemo(
        () =>
            state?.from || from === 'popups'
                ? {
                      name: t.close(),
                      callback: () => (state?.from ? navigate(state.from) : navigate(DashboardRoutes.Personas)),
                  }
                : {
                      name: t.sign_in_account_sign_up_button(),
                      callback: () => navigate(DashboardRoutes.SignUp),
                  },
        [state],
    )

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
