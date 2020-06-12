import React, { useState, ChangeEvent } from 'react'
import StepBase from './StepBase'
import { Box, Typography, styled, Theme, Link as MuiLink, Checkbox, FormControlLabel } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { Link } from 'react-router-dom'
import ActionButton from '../DashboardComponents/ActionButton'
import { InitStep } from '../InitStep'

const LinedBox = styled('div')(({ theme }: { theme: Theme }) => ({
    border: '1px solid #ddd',
    borderRadius: theme.shape.borderRadius,
    textAlign: 'start',
    width: '100%',
    padding: '1rem 1.25rem',
    [theme.breakpoints.down('xs')]: {
        '& > *': { minWidth: '100%' },
        textAlign: 'center',
    },
}))

export default function Disclaimer() {
    const { t } = useI18N()
    const [checked, setChecked] = useState(false)
    const header = t('dashboard_init_step_-1')
    const content = (
        <div style={{ width: '100%' }}>
            <LinedBox>
                <Typography>{t('dashboard_init_step_-1_hint')}</Typography>
                <Box display="flex" alignItems="center">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={checked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) => setChecked(ev.target.checked)}
                            />
                        }
                        label={
                            <>
                                {t('dashboard_init_step_-1_privacy_prefix')}
                                <MuiLink
                                    href="https://maskbook.com/privacy-policy/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    {t('dashboard_init_step_-1_privacy')}
                                </MuiLink>
                                {t('dashboard_init_step_-1_privacy_suffix')}
                            </>
                        }
                    />
                </Box>
                <Box display="flex" justifyContent="flex-end">
                    <ActionButton<typeof Link>
                        variant="contained"
                        color="primary"
                        component={Link}
                        disabled={!checked}
                        to={InitStep.Setup0}>
                        {t('get_started')}
                    </ActionButton>
                </Box>
            </LinedBox>
        </div>
    )
    return <StepBase subheader={header}>{content}</StepBase>
}
