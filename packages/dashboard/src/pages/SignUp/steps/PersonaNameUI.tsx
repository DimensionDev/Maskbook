import { MaskTextField, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { useState } from 'react'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardI18N } from '../../../locales/index.js'

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

export interface PersonaNameUIProps {
    error?: string
    onNext(personaName: string): void
    loading?: boolean
}

export function PersonaNameUI({ onNext, error, loading }: PersonaNameUIProps) {
    const { classes } = useStyles()
    const t = useDashboardI18N()

    const [personaName, setPersonaName] = useState('')

    return (
        <>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    {t.data_recovery_set_name()}
                </Typography>
            </Box>
            <Typography className={classes.second} mt={2}>
                {t.data_recovery_name_tip()}
            </Typography>

            <Typography className={classes.second} mt={3} mb={2}>
                {t.persona_name()}
            </Typography>
            <MaskTextField
                onChange={(e) => {
                    setPersonaName(e.target.value)
                }}
                required
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
                        disabled={!personaName || loading}>
                        {t.continue()}
                    </PrimaryButton>
                </div>
            </SetupFrameController>
        </>
    )
}
