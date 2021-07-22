import { memo } from 'react'
import { MaskTextField } from '@masknet/theme'
import { Button, Container } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { MaskAlert } from '../MaskAlert'
import { ButtonGroup } from '../RegisterFrame/ButtonGroup'

export const RestoreFromPrivateKey = memo(() => {
    const t = useDashboardI18N()
    return (
        <>
            <Container>
                <MaskTextField
                    sx={{ width: '100%' }}
                    multiline
                    rows={8}
                    placeholder={t.sign_in_account_private_key_placeholder()}
                />
            </Container>
            <ButtonGroup>
                <Button variant="rounded" color="secondary">
                    {t.cancel()}
                </Button>
                <Button variant="rounded" color="primary">
                    {t.next()}
                </Button>
            </ButtonGroup>
            <Container sx={{ marginTop: '35px' }}>
                <MaskAlert description={t.sign_in_account_private_key_warning()} />
            </Container>
        </>
    )
})
