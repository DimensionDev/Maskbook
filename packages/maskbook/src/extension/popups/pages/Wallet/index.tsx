import { InitialPlaceholder } from '../../components/InitialPlaceholder'
import { Typography, Box } from '@material-ui/core'
import { MaskWalletIcon } from '@masknet/icons'
import { useI18N } from '../../../../utils'
import { WalletStartUp } from './components/StartUp'
import { useMyPersonas } from '../../../../components/DataSource/useMyPersonas'

export default function Wallet() {
    const { t } = useI18N()
    const personas = useMyPersonas()

    //TODO: replace to sign state
    return personas.length === 0 ? (
        <InitialPlaceholder>
            <Box style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 10, backgroundColor: '#F7F9FA' }}>
                <MaskWalletIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography style={{ fontSize: 14 }}>
                {t('popups_initial_tips', {
                    type: 'wallet',
                })}
            </Typography>
        </InitialPlaceholder>
    ) : (
        <WalletStartUp />
    )
}
