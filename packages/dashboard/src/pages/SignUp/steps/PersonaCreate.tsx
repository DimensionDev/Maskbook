import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useMnemonicWordsPuzzle } from '@masknet/web3-shared'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../type'
import { MaskAlert } from '../../../components/MaskAlert'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Button } from '@material-ui/core'
import { ButtonGroup } from '../components/ActionGroup'
import { useDashboardI18N } from '../../../locales'
import { SignUpRoutePath } from '../routePath'
import { MaskTextField } from '@masknet/theme'

export const PersonaCreate = () => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const [words] = useMnemonicWordsPuzzle()
    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_identity_title()}
                action={{ name: t.create_account_sign_in_button(), callback: () => navigate(RoutePaths.Login) }}
            />
            <Body>
                <SignUpAccountLogo />
                <div>
                    <MaskTextField
                        label="Name"
                        variant="filled"
                        InputProps={{ disableUnderline: true }}
                        onChange={(e) => {}}
                    />
                    <ButtonGroup>
                        <Button color={'secondary'}>Back</Button>
                        <Button
                            color={'primary'}
                            onClick={() => {
                                navigate(`${RoutePaths.SignUp}/${SignUpRoutePath.ConnectSocialMedial}`)
                            }}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
                <MaskAlert description={t.create_account_identity_warning()} type={'error'} />
            </Body>
            <Footer></Footer>
        </ColumnContentLayout>
    )
}
