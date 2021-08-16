import { RowLayout } from '../../components/RegisterFrame/RowLayout'
import { ImportWallet } from '../Wallets/components/ImportWallet'
import { Header } from '../../components/RegisterFrame/ColumnContentHeader'
import { useDashboardI18N } from '../../locales'
import { Body, ColumnContentLayout, Footer } from '../../components/RegisterFrame/ColumnContentLayout'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'

export default function Login() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    return (
        <RowLayout>
            <ColumnContentLayout>
                <Header
                    title={t.sign_in_account_identity_title()}
                    action={{ name: t.sign_in_account_sign_up_button(), callback: () => navigate(RoutePaths.SignUp) }}
                />
                <Body>
                    <ImportWallet />
                </Body>
                <Footer />
            </ColumnContentLayout>
        </RowLayout>
    )
}
