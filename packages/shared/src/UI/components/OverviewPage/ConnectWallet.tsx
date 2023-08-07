import { Box, Paper, Stack } from '@mui/material'
import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { ActionCard } from './ActionCard.js'
import { SelectProviderModal, useSharedI18N } from '../../../index.js'

export const ConnectWallet = memo(() => {
    const t = useSharedI18N()

    return (
        <Paper variant="background" sx={{ width: '100%', height: '100%' }}>
            <Stack justifyContent="center" height="100%" alignItems="center">
                <Box>
                    <ActionCard
                        title={t.plugin_wallet_connect_a_wallet()}
                        icon={<Icons.CloudLink />}
                        subtitle={t.plugin_wallet_connect_desc()}
                        action={{
                            type: 'primary',
                            text: t.connect(),
                            handler: () => SelectProviderModal.open(),
                        }}
                    />
                </Box>
            </Stack>
        </Paper>
    )
})
