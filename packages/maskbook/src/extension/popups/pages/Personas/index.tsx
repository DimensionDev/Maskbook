import { memo } from 'react'
import { InitialPlaceholder } from '../../components/InitialPlaceholder'
import { MasksIcon } from '@masknet/icons'
import { Box, Typography } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import { PersonaStartUp } from './components/StartUp'
import { useMyPersonas } from '../../../../components/DataSource/useMyPersonas'

const Persona = memo(() => {
    const { t } = useI18N()
    const personas = useMyPersonas()

    //TODO: replace to sign state
    return personas.length === 0 ? (
        <InitialPlaceholder>
            <Box style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 10, backgroundColor: '#F7F9FA' }}>
                <MasksIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography style={{ fontSize: 14 }}>
                {t('popups_initial_tips', {
                    type: 'Personas',
                })}
            </Typography>
        </InitialPlaceholder>
    ) : (
        <PersonaStartUp />
    )
})

export default Persona
