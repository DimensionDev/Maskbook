import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../type'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Button } from '@material-ui/core'
import { ButtonGroup } from '../components/ActionGroup'
import { useDashboardI18N } from '../../../locales'
import { DesktopMnemonicConfirm } from '../../../components/Mnemonic'
import { SignUpRoutePath } from '../routePath'

export const MnemonicConfirmForm = () => {
    const navigate = useNavigate()
    const t = useDashboardI18N()

    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_identity_title()}
                action={{ name: 'Recovery & Sign In', callback: () => navigate(RoutePaths.Login) }}
            />
            <Body>
                <SignUpAccountLogo />
                <div>
                    <DesktopMnemonicConfirm onChange={() => {}} />
                    <ButtonGroup>
                        <Button color={'secondary'}>Back</Button>
                        <Button
                            color={'primary'}
                            onClick={() => navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.PersonaCreate}`)}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
                <MaskAlert description={t.create_account_identity_warning()} type={'error'} />
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
