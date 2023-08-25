import { DashboardRoutes, EnhanceableSite } from '@masknet/shared-base'
import { useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Services } from '../../../API.js'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { delay } from '@masknet/kit'
import { MaskTextField, makeStyles } from '@masknet/theme'
import { Typography, Button } from '@mui/material'
import { Box } from '@mui/system'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'

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
    recovery: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
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

export const SignUp = memo(function SignUp() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const { classes } = useStyles()
    const [personaName, setPersonaName] = useState('')
    const [error, setError] = useState('')

    const onNext = useCallback(async () => {
        setError('')

        const personas = await Services.Identity.queryOwnedPersonaInformation(true)
        const existing = personas.some((x) => x.nickname === personaName)

        if (existing) {
            return setError(t.create_account_persona_exists())
        }

        navigate(DashboardRoutes.SignUpPersonaMnemonic, {
            replace: true,
            state: {
                personaName,
            },
        })
    }, [personaName])

    const onSkip = useCallback(async () => {
        const url = await Services.SiteAdaptor.setupSite(EnhanceableSite.Twitter, false)
        if (!url) return
        await delay(300)
        await browser.tabs.create({
            active: true,
            url,
        })
        window.close()
    }, [])

    const handleRecovery = useCallback(() => {
        navigate(DashboardRoutes.RecoveryPersona)
    }, [])

    return (
        <>
            <Box className={classes.header}>
                <Typography className={classes.second}>{t.create_step({ step: '1', totalSteps: '2' })}</Typography>
                <Button variant="text" className={classes.recovery} onClick={handleRecovery}>
                    {t.recovery()}
                </Button>
            </Box>
            <Typography variant="h1" className={classes.title}>
                {t.persona_create_title()}
            </Typography>
            <Typography className={classes.second} mt={2}>
                {t.persona_create_tips()}
            </Typography>
            <Typography className={classes.second} mt={3} mb={2}>
                {t.persona()}
            </Typography>
            <MaskTextField
                onChange={(e) => {
                    if (error) setError('')
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
                    <SecondaryButton width="125px" size="large" onClick={onSkip}>
                        {t.skip()}
                    </SecondaryButton>
                    <PrimaryButton
                        width="125px"
                        size="large"
                        onClick={() => onNext()}
                        disabled={!personaName.trim().length}>
                        {t.continue()}
                    </PrimaryButton>
                </div>
            </SetupFrameController>
        </>
    )
})
