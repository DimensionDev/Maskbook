import React, { useState } from 'react'
import StepBase from './StepBase'
import { Typography } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import { Link } from 'react-router-dom'
import ActionButton from '../DashboardComponents/ActionButton'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import Services from '../../service'
import { ECKeyIdentifier } from '../../../database/type'
import { Persona } from '../../../database'
import { useAsync } from '../../../utils/components/AsyncComponent'
import ProfileBox from '../DashboardComponents/ProfileBox'
import { useMyPersonas } from '../../../components/DataSource/useActivatedUI'

const header = 'Step 2: Connect a social network profile'
const subheader = 'Now we support Facebook and Twitter.'

export default function InitStep2S() {
    const { identifier } = useQueryParams(['identifier'])
    const personas = useMyPersonas()
    const [persona, setPersona] = useState<Persona | null>(null)
    useAsync(async () => {
        if (identifier)
            Services.Identity.queryPersona(ECKeyIdentifier.fromString(identifier!)! as ECKeyIdentifier).then(setPersona)
    }, [identifier, personas])

    const actions = (
        <>
            <ActionButton variant="outlined" color="default" component={Link} to="1s">
                Back
            </ActionButton>
            <ActionButton
                variant="contained"
                color="primary"
                disabled={persona?.linkedProfiles.size === 0}
                component={Link}
                to="../">
                Finish
            </ActionButton>
        </>
    )

    const content = (
        <div style={{ alignSelf: 'stretch', width: '100%' }}>
            <Typography style={{ paddingBottom: '0.5rem' }} variant="h5">
                {persona?.nickname ?? 'Unknown Persona'}
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
