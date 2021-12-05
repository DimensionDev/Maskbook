import { Typography } from '@mui/material'
import { useI18N } from '../../../utils'
interface DonationPageProps {}
export function DonationPage(props: DonationPageProps) {
    const { t } = useI18N()
    return (
        <Typography variant="body1" color="textPrimary">
            {t('donation')}
        </Typography>
    )
}
