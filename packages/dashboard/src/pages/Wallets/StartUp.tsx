import { styled } from '@mui/material/styles'
import { Icons } from '@masknet/icons'
import { useDashboardI18N } from '../../locales/index.js'
import { Paper, Stack, Box } from '@mui/material'
import { ActionCard } from '../../components/ActionCard/index.js'
import { SelectProviderModal } from '@masknet/shared'

const Container = styled('div')`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`

export function StartUp() {
    const t = useDashboardI18N()

    return (
        <Container>
            <Paper variant="background" sx={{ width: '100%', height: '100%' }}>
                <Stack justifyContent="center" height="100%" alignItems="center">
                    <Box>
                        <ActionCard
                            title={t.wallets_startup_connect()}
                            icon={<Icons.CloudLink />}
                            subtitle={t.wallets_startup_connect_desc()}
                            action={{
                                type: 'primary',
                                text: t.wallets_startup_connect_action(),
                                handler: SelectProviderModal.open,
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>
        </Container>
    )
}
