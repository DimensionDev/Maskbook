import { makeStyles } from '@masknet/theme'
import { Box, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    second: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    title: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
    },
}))

interface PersonaNameUIProps {
    error?: string
    onNext(personaName: string): void
    loading?: boolean
}

export function PersonaNameUI({ onNext, error, loading }: PersonaNameUIProps) {
    const { classes } = useStyles()

    const [personaName, setPersonaName] = useState('')

    return (
        <>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    <Trans>Set Your Persona Name</Trans>
                </Typography>
            </Box>
            <Typography className={classes.second} mt={2}>
                <Trans>Set your persona name with maximum length of 24 characters</Trans>
            </Typography>

            <Typography className={classes.second} mt={3} mb={2}>
                <Trans>Persona Name</Trans>
            </Typography>
            <TextField
                onChange={(e) => {
                    setPersonaName(e.target.value)
                }}
                required
                autoFocus
                InputProps={{ disableUnderline: true }}
                inputProps={{ maxLength: 24 }}
                error={!!error}
                helperText={error}
            />

            <SetupFrameController>
                <div className={classes.buttonGroup}>
                    <PrimaryButton
                        loading={loading}
                        width="125px"
                        size="large"
                        color="primary"
                        onClick={() => onNext(personaName)}
                        disabled={!personaName.trim().length || loading}>
                        <Trans>Continue</Trans>
                    </PrimaryButton>
                </div>
            </SetupFrameController>
        </>
    )
}
