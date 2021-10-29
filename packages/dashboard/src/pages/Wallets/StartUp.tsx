import { styled } from '@mui/material/styles'
import { CloudLinkIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../locales'
import { Paper, Stack, Box } from '@mui/material'
import { ActionCard } from '../../components/ActionCard'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../API'

const Container = styled('div')`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`

export function StartUp() {
    const t = useDashboardI18N()
    const { openDialog: openConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectProviderDialogUpdated,
    )

    return (
        <Container>
            <Paper variant="background" sx={{ width: '100%', height: '100%' }}>
                <Stack justifyContent="center" height="100%" alignItems="center">
                    <Box>
                        <ActionCard
                            title={t.wallets_startup_connect()}
                            icon={<CloudLinkIcon fontSize="inherit" />}
                            subtitle={t.wallets_startup_connect_desc()}
                            action={{
                                type: 'primary',
                                text: t.wallets_startup_connect_action(),
                                handler: openConnectWalletDialog,
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>
        </Container>
    )
}
