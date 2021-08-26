import { styled } from '@material-ui/core/styles'
import { CloudLinkIcon, ImportWalletIcon, MaskWalletIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import { Paper, Stack, Box } from '@material-ui/core'
import { ActionCard } from '../../components/ActionCard'

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
                            title={t.wallets_startup_create()}
                            icon={<MaskWalletIcon fontSize="inherit" />}
                            subtitle={t.wallets_startup_create_desc()}
                            action={{
                                type: 'primary',
                                text: t.wallets_startup_create_action(),
                                handler: () => {},
                            }}
                        />
                        <ActionCard
                            title={t.wallets_startup_create()}
                            icon={<ImportWalletIcon fontSize="inherit" />}
                            subtitle={t.wallets_startup_create_desc()}
                            action={{
                                type: 'primary',
                                text: t.wallets_startup_create_action(),
                                handler: () => {},
                            }}
                        />
                        <ActionCard
                            title={t.wallets_startup_connect()}
                            icon={<CloudLinkIcon fontSize="inherit" />}
                            subtitle={t.wallets_startup_connect_desc()}
                            action={{
                                type: 'primary',
                                text: t.wallets_startup_connect_action(),
                                handler: () => {},
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>
        </Container>
    )
}
