import {
    Body,
    ColumnContentLayout,
    Footer,
    SignUpAccountLogo,
} from '../../../components/RegisterFrame/ColumnContentLayout'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../type'
import { Header } from '../../../components/RegisterFrame/ColumnContentHeader'
import { Button } from '@material-ui/core'
import { ButtonGroup } from '../components/ActionGroup'
import { useDashboardI18N } from '../../../locales'
import { SetupActionCard } from '../../Setup'
import { Facebook, Instagram, Twitter } from '@material-ui/icons'

export const ConnectSocialMedia = () => {
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
                    <SetupActionCard
                        title={t.setup_page_create_restore_title()}
                        icon={<Twitter />}
                        action={{
                            type: 'primary',
                            text: t.setup_page_create_restore_button(),
                            handler: () => {},
                        }}
                    />
                    <SetupActionCard
                        title={t.setup_page_create_restore_title()}
                        icon={<Facebook />}
                        action={{
                            type: 'primary',
                            text: t.setup_page_create_restore_button(),
                            handler: () => {},
                        }}
                    />
                    <SetupActionCard
                        title={t.setup_page_create_restore_title()}
                        icon={<Instagram />}
                        action={{
                            type: 'primary',
                            text: t.setup_page_create_restore_button(),
                            handler: () => {},
                        }}
                    />
                    <ButtonGroup>
                        <Button color={'secondary'}>Back</Button>
                        <Button color={'primary'} onClick={() => {}}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
            </Body>
            <Footer />
        </ColumnContentLayout>
    )
}
