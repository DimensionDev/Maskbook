import { memo, useCallback } from 'react'
import { Box, List } from '@mui/material'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { ActionButton, makeStyles } from '@masknet/theme'
import { PersonaContext } from '@masknet/shared'
import { PersonaItem } from './PersonaItem.js'
import { DashboardRoutes, type PersonaInformation } from '@masknet/shared-base'
import Services from '../../../service.js'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'

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

export const SwitchPersonaModal = memo<ActionModalBaseProps>(function SwitchPersonaModal({ ...rest }) {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const { personas, currentPersona } = PersonaContext.useContainer()

    const handleOpenDashboard = useCallback((route: DashboardRoutes) => {
        browser.tabs.create({
            active: true,
            url: browser.runtime.getURL(`/dashboard.html#${route}`),
        })
        if (navigator.userAgent.includes('Firefox')) {
            window.close()
        }
        Services.Helper.removePopupWindow()
    }, [])

    const handleSelect = useCallback((persona: PersonaInformation) => {
        Services.Settings.setCurrentPersonaIdentifier(persona.identifier).then(() => navigate(-1))
    }, [])

    const action = (
        <Box className={classes.modalAction}>
            <ActionButton
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<Icons.PopupRestore size={18} />}
                onClick={() => handleOpenDashboard(DashboardRoutes.RecoveryPersona)}>
                {t('popups_recovery')}
            </ActionButton>
            <ActionButton
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<Icons.History size={18} />}
                onClick={() => handleOpenDashboard(DashboardRoutes.Settings)}>
                {t('backup')}
            </ActionButton>
            <ActionButton
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<Icons.AddUser size={18} />}
                onClick={() => handleOpenDashboard(DashboardRoutes.SignUpPersona)}>
                {t('add')}
            </ActionButton>
        </Box>
    )

    return (
        <ActionModal header={t('popups_switch_persona')} action={action} {...rest}>
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
