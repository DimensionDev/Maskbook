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
    const header = 'Be aware of your data when using Maskbook.'
    const content = (
        <div style={{ width: '100%' }}>
            <LinedBox>
                <Typography>
                    Maskbook will collect some data when you use, but the developers of Maskbook have no access to them.
                    The collected data are stored locally, except for the data which are necessary for enabling your
                    friends to decrypt the posts you shared.
                </Typography>
                <Typography>
                    The data being collected include: Your social network profile URL, the Maskbook public keys of your
                    contacts (friends, who you follow, and who follow you), the relations between you and your contacts,
                    the cleartext of your posts, the encryption keys of your posts, and the data managed by each Plugin
                    in Maskbook (they have their own privacy policies).
                </Typography>
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
                                I understand this and accept the{' '}
                                <MuiLink
                                    href="https://maskbook.com/privacy-policy/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    privacy policy
                                </MuiLink>
                                .
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
                        Get Started
                    </ActionButton>
                </Box>
            </LinedBox>
        </div>
    )
    return <StepBase subheader={header}>{content}</StepBase>
}
