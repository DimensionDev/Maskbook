import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Button, Card, Typography } from '@material-ui/core'
import type { ReactNode } from 'react'
import { SignUpAccountIcon, RestoreIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'

const Content = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(1)} ${theme.spacing(8)};
`,
)

const Header = styled('header')(
    ({ theme }) => `
    padding-bottom: ${theme.spacing(4)};
    text-align: center;
`,
)

const Title = styled('div')(
    ({ theme }) => `
    text-align: center;
    padding: ${theme.spacing(3)} 0 ${theme.spacing(1)} 0;
`,
)

const ActionCards = styled('div')(
    ({ theme }) => `
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 540px;
`,
)

const ActionCardContainer = styled(Card)(
    ({ theme }) => `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing(2.5)};
    margin-bottom: ${theme.spacing(2.5)};

    & > div > p {
        margin-bottom: 0;
    }
`,
)

const ActionCardIcon = styled('div')(
    ({ theme }) => `
    width: 36px;
    height: 36px;
    margin-right: ${theme.spacing(2)};

    & > svg {
        width: 100%;
        height: 100%;
    }
`,
)

const ActionCardContent = styled('div')(
    ({ theme }) => `
    flex: 1
`,
)

const ActionCardButton = styled('div')(
    ({ theme }) => `
    margin-left: ${theme.spacing(1)};
    font-size: 14px;

    & > button {
        width: 140px;
        border-radius: ${theme.spacing(2)};
    }
`,
)

interface ISetupActionCardProps {
    icon: ReactNode
    title: string
    subtitle: string
    action: {
        type: 'secondary' | 'primary'
        text: string
    }
}

const SetupActionCard: React.FC<ISetupActionCardProps> = ({ icon, title, subtitle, action }) => {
    return (
        <ActionCardContainer variant="outlined">
            <ActionCardIcon>{icon}</ActionCardIcon>
            <ActionCardContent>
                <Typography variant="body1" paragraph>
                    {title}
                </Typography>
                <Typography variant="body2" paragraph>
                    {subtitle}
                </Typography>
            </ActionCardContent>
            <ActionCardButton>
                <Button size="small" variant="contained" color={action.type}>
                    {action.text}
                </Button>
            </ActionCardButton>
        </ActionCardContainer>
    )
}

// todo: dark theme style
const Setup = () => {
    const t = useDashboardI18N()

    return (
        <ColumnLayout>
            <Content>
                <Header>
                    <Title>
                        <Typography variant="h3">{t.setup_page_title()}</Typography>
                    </Title>
                    <Typography variant="body2" paragraph>
                        {t.setup_page_description()}
                    </Typography>
                </Header>
                <ActionCards>
                    <SetupActionCard
                        title={t.setup_page_create_account_title()}
                        subtitle={t.setup_page_create_account_subtitle()}
                        icon={<SignUpAccountIcon />}
                        action={{
                            type: 'primary',
                            text: t.setup_page_create_account_button(),
                        }}
                    />
                    <SetupActionCard
                        title={t.setup_page_create_restore_title()}
                        subtitle={t.setup_page_create_restore_subtitle()}
                        icon={<RestoreIcon />}
                        action={{
                            type: 'secondary',
                            text: t.setup_page_create_restore_button(),
                        }}
                    />
                </ActionCards>
            </Content>
        </ColumnLayout>
    )
}

export default Setup
