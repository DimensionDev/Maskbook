import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout'
import { styled } from '@mui/material/styles'
import { Box, Container, Stack, Typography } from '@mui/material'
import { RestoreIcon, SignUpAccountIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import { RoutePaths } from '../../type'
import { useNavigate } from 'react-router-dom'
import { ActionCard } from '../../components/ActionCard'

const Title = styled('div')(
    ({ theme }) => `
    text-align: center;
    padding: ${theme.spacing(3)} 0 ${theme.spacing(1)} 0;
`,
)

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
                <Stack justifyContent="space-between" maxWidth="600px" margin="0 auto">
                    <ActionCard
                        title={t.setup_page_create_account_title()}
                        subtitle={t.setup_page_create_account_subtitle()}
                        icon={<SignUpAccountIcon />}
                        action={{
                            type: 'primary',
                            text: t.setup_page_create_account_button(),
                            handler: () => navigate(RoutePaths.SignUp),
                        }}
                    />
                    <ActionCard
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
