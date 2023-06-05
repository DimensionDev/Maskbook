import { delay } from '@masknet/kit'
import { DashboardRoutes, EnhanceableSite } from '@masknet/shared-base'
import { MaskTabList, makeStyles, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { Button, Tab, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { first } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Services } from '../../../API.js'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SecondaryButton } from '../../../components/SecondaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'

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
    setup: {
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
    tabContainer: {
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)',
        padding: theme.spacing('14px', 2, 0),
        borderRadius: theme.spacing(1, 1, 0, 0),
        marginTop: theme.spacing(3),
    },
    tab: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'Helvetica',
    },
    buttonGroup: {
        display: 'flex',
        columnGap: 12,
    },
}))

export const Recovery = memo(function Recovery() {
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
        const url = await Services.SocialNetwork.setupSite(EnhanceableSite.Twitter, false)
        if (!url) return
        await delay(300)
        browser.tabs.create({
            active: true,
            url,
        })
        window.close()
    }, [])

    const tabs = useMemo(() => {
        return [
            {
                id: 'words',
                label: 'Identity words',
            },
            {
                id: 'privateKey',
                label: 'Private Key',
            },
            {
                id: 'localBackup',
                label: 'Local Backup',
            },
            {
                id: 'cloudBackup',
                label: 'Cloud Backup',
            },
        ]
    }, [])

    const [currentTab, onChange] = useTabs(first(tabs)!.id, ...tabs.map((tab) => tab.id))

    return (
        <Box>
            <Box className={classes.header}>
                <Typography variant="h1" className={classes.title}>
                    {t.data_recovery_title()}
                </Typography>
                <Button variant="text" className={classes.setup}>
                    {t.sign_up()}
                </Button>
            </Box>

            <Typography className={classes.second} mt={2}>
                {t.data_recovery_description()}
            </Typography>
            <div className={classes.tabContainer}>
                <TabContext value={currentTab}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="Recovery Methods">
                        {tabs.map((tab) => (
                            <Tab key={tab.id} className={classes.tab} label={tab.label} value={tab.id} />
                        ))}
                    </MaskTabList>
                </TabContext>
            </div>
            <SetupFrameController>
                <div className={classes.buttonGroup}>
                    <SecondaryButton width="125px" size="large" onClick={onSkip}>
                        {t.skip()}
                    </SecondaryButton>
                    <PrimaryButton
                        width="125px"
                        size="large"
                        color="primary"
                        onClick={() => onNext()}
                        disabled={!personaName}>
                        {t.continue()}
                    </PrimaryButton>
                </div>
            </SetupFrameController>
        </Box>
    )
})
