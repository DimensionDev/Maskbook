import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { styled } from '@mui/material/styles'
import { Box, Container, Stack, Typography } from '@mui/material'
import { DashboardRoutes } from '@masknet/shared-base'
import { useDashboardI18N } from '../../locales/index.js'
import { ActionCard } from '../../components/ActionCard/index.js'
import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout.js'

const Title = styled('div')(
    ({ theme }) => `
    text-align: center;
    padding: ${theme.spacing(3)} 0 ${theme.spacing(1)} 0;
`,
)

function Setup() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    return (
        <ColumnLayout>
            <Container sx={{ paddingBottom: (theme) => theme.spacing(8) }}>
                <Box textAlign="center" paddingBottom="32px">
                    <Title>
                        <Typography variant="h3">{t.setup_page_title()}</Typography>
                    </Title>
                    <Typography variant="body2" paragraph>
                        {t.setup_page_description()}
                    </Typography>
                </Box>
                <Stack justifyContent="space-between" maxWidth="600px" margin="0 auto">
                    <ActionCard
                        title={t.setup_page_create_account_title()}
                        subtitle={t.setup_page_create_account_subtitle()}
                        icon={<Icons.SignUpAccount />}
                        action={{
                            type: 'primary',
                            text: t.setup_page_create_account_button(),
                            handler: () => navigate(DashboardRoutes.SignUp),
                        }}
                    />
                    <ActionCard
                        title={t.setup_page_create_restore_title()}
                        subtitle={t.setup_page_create_restore_subtitle()}
                        icon={<Icons.RestoreColorful />}
                        action={{
                            type: 'secondary',
                            text: t.setup_page_create_restore_button(),
                            handler: () => navigate(DashboardRoutes.SignIn),
                        }}
                    />
                </Stack>
            </Container>
        </ColumnLayout>
    )
}

export default Setup
