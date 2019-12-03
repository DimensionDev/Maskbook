import React, { useRef, useState } from 'react'
import StepBase from './StepBase'
import { Typography } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import ProviderLine from '../DashboardComponents/ProviderLine'
import { Link, useHistory } from 'react-router-dom'
import Buttone from '../../../components/Dashboard/Buttone'

const header = 'Step 2: Connect a social network profile'
const subheader = 'Now we support Facebook and Twitter.'

const actions = (
    <>
        <Buttone className="actionButton" variant="outlined" color="default" component={Link} to="1s">
            Back
        </Buttone>
        <Buttone className="actionButton" variant="contained" color="primary" disabled component={Link} to="start">
            Finish
        </Buttone>
    </>
)

export default function InitStep2S() {
    const history = useHistory()
    const search = new URLSearchParams(history.location.search)
    const name = search.get('name')

    const content = (
        <div style={{ alignSelf: 'stretch', width: '100%' }}>
            <Typography style={{ paddingBottom: '0.5rem' }} variant="h5">
                {name}
            </Typography>
            <ProviderLine border network="facebook" connected id="@yisiliu"></ProviderLine>
            <ProviderLine border network="twitter"></ProviderLine>
        </div>
    )

    return (
        <StepBase header={header} subheader={subheader} actions={actions}>
            {content}
        </StepBase>
    )
}
