import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Box, Button, Card, Container, Stack, Typography } from '@material-ui/core'
import type { ReactNode } from 'react'
import { SignUpAccountIcon, RestoreIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import { RoutePaths } from '../../type'
import { useNavigate } from 'react-router'

const Title = styled('div')(
    ({ theme }) => `
    text-align: center;
    padding: ${theme.spacing(3)} 0 ${theme.spacing(1)} 0;
`,
)

const ActionCardIcon = styled('div')(
    ({ theme }) => `
    width: 36px;
    height: 36px;

    & > svg {
        width: 100%;
        height: 100%;
    }
`,
)

const ActionCardButton = styled('div')(
    ({ theme }) => `
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
    subtitle?: string
    action: {
        type: 'secondary' | 'primary'
        text: string
        handler: () => void
    }
}

export const SetupActionCard = ({ icon, title, subtitle, action }: ISetupActionCardProps) => {
    return (
        <Card
            variant="outlined"
            sx={{ padding: (theme) => theme.spacing(2.5), marginBottom: (theme) => theme.spacing(2.5) }}>
            <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between" width="100%">
                <ActionCardIcon>{icon}</ActionCardIcon>
                <Box flex={1}>
                    <Typography variant="body1" paragraph sx={{ marginBottom: 0 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ marginBottom: 0 }}>
                        {subtitle}
                    </Typography>
                </Box>
                <ActionCardButton>
                    <Button size="small" variant="contained" color={action.type} onClick={action.handler}>
                        {action.text}
                    </Button>
                </ActionCardButton>
            </Stack>
        </Card>
    )
}

// todo: dark theme style
const Setup = () => {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    return (
        <ColumnLayout>
            <Container sx={{ paddingBottom: (theme) => `${theme.spacing(8)}` }}>
                <Box textAlign="center" paddingBottom="32px">
                    <Title>
                        <Typography variant="h3">{t.setup_page_title()}</Typography>
                    </Title>
                    <Typography variant="body2" paragraph>
                        {t.setup_page_description()}
                    </Typography>
                </Box>
                <Stack justifyContent="space-between" width="545px" margin="0 auto">
                    <SetupActionCard
                        title={t.setup_page_create_account_title()}
                        subtitle={t.setup_page_create_account_subtitle()}
                        icon={<SignUpAccountIcon />}
                        action={{
                            type: 'primary',
                            text: t.setup_page_create_account_button(),
                            handler: () => navigate(RoutePaths.SignUp),
                        }}
                    />
                    <SetupActionCard
                        title={t.setup_page_create_restore_title()}
                        subtitle={t.setup_page_create_restore_subtitle()}
                        icon={<RestoreIcon />}
                        action={{
                            type: 'secondary',
                            text: t.setup_page_create_restore_button(),
                            handler: () => navigate(RoutePaths.SignIn),
                        }}
                    />
                </Stack>
            </Container>
        </ColumnLayout>
    )
}

export default Setup
