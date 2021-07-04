import { memo } from 'react'
import { useDashboardI18N } from '../../locales'
import { MaskTextField } from '@masknet/theme'
import { experimentalStyled as styled } from '@material-ui/core/styles'

const Container = styled('div')`
    width: 100%;
`
export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()

    return (
        <Container>
            <MaskTextField label={t.sign_in_account_cloud_backup_email_or_phone_number()} onChange={() => {}} />
            <MaskTextField label={t.sign_in_account_cloud_backup_password()} onChange={() => {}} />
        </Container>
    )
})
