import { memo, useCallback } from 'react'
import { Box, List } from '@mui/material'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { ActionButton, makeStyles } from '@masknet/theme'
import { PersonaContext } from '@masknet/shared'
import { PersonaItem } from './PersonaItem.js'
import { DashboardRoutes, PopupRoutes, type PersonaInformation } from '@masknet/shared-base'
import Services from '#services'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    content: {
        overflow: 'auto',
        backgroundColor: theme.palette.maskColor.bottom,
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        padding: 0,
        overflow: 'auto',
    },
    modalAction: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: theme.spacing(1.5),
    },
}))

export const SwitchPersonaModal = memo<ActionModalBaseProps>(function SwitchPersonaModal(props) {
    const navigate = useNavigate()
    const { classes } = useStyles()
    const { personas, currentPersona } = PersonaContext.useContainer()

    const handleOpenDashboard = useCallback(async (route: DashboardRoutes) => {
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${route}`),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        await Services.Helper.removePopupWindow()
    }, [])

    const handleSelect = useCallback(async (persona: PersonaInformation) => {
        await Services.Settings.setCurrentPersonaIdentifier(persona.identifier)
        navigate(-1)
    }, [])

    const action = (
        <Box className={classes.modalAction}>
            <ActionButton
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<Icons.PopupRestore size={18} />}
                onClick={() => handleOpenDashboard(DashboardRoutes.RecoveryPersona)}>
                <Trans>Recovery</Trans>
            </ActionButton>
            <ActionButton
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<Icons.History size={18} />}
                onClick={() => navigate(PopupRoutes.Settings)}>
                <Trans>Backup</Trans>
            </ActionButton>
            <ActionButton
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<Icons.AddUser size={18} />}
                onClick={() => handleOpenDashboard(DashboardRoutes.SignUpPersona)}>
                <Trans>Add</Trans>
            </ActionButton>
        </Box>
    )

    return (
        <ActionModal header={<Trans>Switch Persona</Trans>} action={action} {...props}>
            <Box className={classes.content}>
                <List dense className={classes.list}>
                    {personas.map((item, index) => (
                        <PersonaItem
                            key={index}
                            persona={item}
                            isSelected={currentPersona?.identifier.toText() === item.identifier.toText()}
                            onSelect={handleSelect}
                        />
                    ))}
                </List>
            </Box>
        </ActionModal>
    )
})
