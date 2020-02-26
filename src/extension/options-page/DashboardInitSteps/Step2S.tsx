import React, { useState } from 'react'
import StepBase from './StepBase'
import { Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { Link } from 'react-router-dom'
import ActionButton from '../DashboardComponents/ActionButton'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import Services from '../../service'
import { ECKeyIdentifier, Identifier } from '../../../database/type'
import { Persona } from '../../../database'
import ProfileBox from '../DashboardComponents/ProfileBox'
import { useMyPersonas } from '../../../components/DataSource/useActivatedUI'
import { InitStep } from '../InitStep'
import { useAsync } from '../../../utils/hooks/useAsync'

export default function InitStep2S() {
    const { t } = useI18N()
    const header = t('dashboard_init_step_2')
    const subheader = t('dashboard_init_step_2_hint')
    const { identifier } = useQueryParams(['identifier'])
    const personas = useMyPersonas()
    const [persona, setPersona] = useState<Persona | null>(null)
    useAsync(async () => {
        if (identifier)
            Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap()).then(setPersona)
    }, [identifier, personas])

    const actions = (
        <>
            <ActionButton<typeof Link> variant="outlined" color="default" component={Link} to={InitStep.Setup1}>
                {t('back')}
            </ActionButton>
            <ActionButton<typeof Link>
                variant="contained"
                color="primary"
                disabled={persona?.linkedProfiles.size === 0}
                component={Link}
                to="../">
                {t('finish')}
            </ActionButton>
        </>
    )

    const content = (
        <div style={{ alignSelf: 'stretch', width: '100%' }}>
            <Typography style={{ paddingBottom: '0.5rem' }} variant="h5">
                {persona?.nickname ?? t('unknown_persona')}
            </Typography>
            <ProfileBox persona={persona} />
        </div>
    )

    return (
        <StepBase header={header} subheader={subheader} actions={actions}>
            {content}
        </StepBase>
    )
}
