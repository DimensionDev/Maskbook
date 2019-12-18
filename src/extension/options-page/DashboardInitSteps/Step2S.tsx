import React, { useState } from 'react'
import StepBase from './StepBase'
import { Typography } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import { Link } from 'react-router-dom'
import ActionButton from '../DashboardComponents/ActionButton'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import Services from '../../service'
import { ECKeyIdentifier, Identifier } from '../../../database/type'
import { Persona } from '../../../database'
import { useAsync } from '../../../utils/components/AsyncComponent'
import ProfileBox from '../DashboardComponents/ProfileBox'
import { useMyPersonas } from '../../../components/DataSource/useActivatedUI'
import { InitStep } from '../InitStep'

const header = geti18nString('dashboard_init_step_2')
const subheader = geti18nString('dashboard_init_step_2_hint')

export default function InitStep2S() {
    const { identifier } = useQueryParams(['identifier'])
    const personas = useMyPersonas()
    const [persona, setPersona] = useState<Persona | null>(null)
    useAsync(async () => {
        if (identifier)
            Services.Identity.queryPersona(
                Identifier.fromString(identifier, ECKeyIdentifier).unwrap('Cast failed'),
            ).then(setPersona)
    }, [identifier, personas])

    const actions = (
        <>
            <ActionButton<typeof Link> variant="outlined" color="default" component={Link} to={InitStep.Setup1}>
                {geti18nString('back')}
            </ActionButton>
            <ActionButton<typeof Link>
                variant="contained"
                color="primary"
                disabled={persona?.linkedProfiles.size === 0}
                component={Link}
                to="../">
                {geti18nString('finish')}
            </ActionButton>
        </>
    )

    const content = (
        <div style={{ alignSelf: 'stretch', width: '100%' }}>
            <Typography style={{ paddingBottom: '0.5rem' }} variant="h5">
                {persona?.nickname ?? geti18nString('unknown_persona')}
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
