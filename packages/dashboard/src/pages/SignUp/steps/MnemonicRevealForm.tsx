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
import { MnemonicRevealLG } from '../../../components/Mnemonic'

export const MnemonicRevealForm = () => {
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const [words] = useMnemonicWordsPuzzle()
    return (
        <ColumnContentLayout>
            <Header
                title={t.create_account_identity_title()}
                action={{ name: 'Recovery & Sign In', callback: () => navigate(RoutePaths.Login) }}
            />
            <Body>
                <SignUpAccountLogo />
                <div>
                    <MnemonicRevealLG words={words} />
                    <ButtonGroup>
                        <Button color={'secondary'}>Back</Button>
                        <Button color={'primary'} onClick={() => {}}>
                            Agree
                        </Button>
                    </ButtonGroup>
                </div>
                <MaskAlert description={t.create_account_identity_warning()} type={'error'} />
            </Body>
            <Footer></Footer>
        </ColumnContentLayout>
    )
}
