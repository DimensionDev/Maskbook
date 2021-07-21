import { memo } from 'react'
import { MaskTextField } from '@masknet/theme'
import { Button, Container, Stack } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { MaskAlert } from '../MaskAlert'

export const RestoreFromPrivateKey = memo(() => {
    const t = useDashboardI18N()
    return (
        <>
            <Container>
                <MaskTextField
                    sx={{ width: '100%' }}
                    multiline
                    rows={8}
                    defaultValue={t.sign_in_account_private_key_placeholder()}
                />
            </Container>
            <Stack direction="row" spacing={2}>
                <Button sx={{ width: '224px' }} variant="rounded" color="secondary">
                    {t.cancel()}
                </Button>
                <Button sx={{ width: '224px' }} variant="rounded" color="primary">
                    {t.next()}
                </Button>
            </Stack>
            <Container sx={{ marginTop: '35px' }}>
                <MaskAlert description={t.sign_in_account_private_key_warning()} />
            </Container>
        </>
    )
})
