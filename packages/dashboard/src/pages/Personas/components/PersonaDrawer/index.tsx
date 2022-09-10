import { memo } from 'react'
import { Box, Button, Drawer, Stack } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { PersonaContext } from '../../hooks/usePersonaContext.js'
import { PersonaCard } from '../PersonaCard/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'
import { PersonaIdentifier, PersonaInformation, DashboardRoutes, MAX_PERSONA_LIMIT } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()((theme) => ({
    paper: {
        // material-ui toolbar height
        top: '64px',
        padding: theme.spacing(3, 3.75, 11.25, 3.75),
        background: MaskColorVar.suspensionBackground,
    },
    backdrop: {
        background: 'none',
        top: 64,
    },
    buttons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridColumnGap: theme.spacing(3.5),
    },
    backup: {
        backgroundColor: MaskColorVar.warning,
        '&:hover': {
            backgroundColor: MaskColorVar.warning,
            boxShadow: `0 0 5px ${MaskColorVar.warning}`,
        },
    },
}))

export interface PersonaDrawer {
    personas: PersonaInformation[]
}

export const PersonaDrawer = memo<PersonaDrawer>(({ personas }) => {
    const { drawerOpen, toggleDrawer, currentPersona, createPersona, changeCurrentPersona } =
        PersonaContext.useContainer()

    return (
        <PersonaDrawerUI
            personas={personas}
            currentPersonaIdentifier={currentPersona?.identifier}
            open={drawerOpen}
            toggleDrawer={toggleDrawer}
            onChangeCurrentPersona={changeCurrentPersona}
            onCreatePersona={createPersona}
        />
    )
})

export interface PersonaDrawerUIProps extends PersonaDrawer {
    open: boolean
    currentPersonaIdentifier?: PersonaIdentifier
    toggleDrawer: () => void
    onChangeCurrentPersona: (persona: PersonaIdentifier) => void
    onCreatePersona: (nickname: string) => void
}

export const PersonaDrawerUI = memo<PersonaDrawerUIProps>(
    ({ open, currentPersonaIdentifier, toggleDrawer, personas, onChangeCurrentPersona, onCreatePersona }) => {
        const { classes } = useStyles()
        const t = useDashboardI18N()
        const navigate = useNavigate()

        return (
            <Drawer
                anchor="right"
                open={open}
                onClose={toggleDrawer}
                variant="temporary"
                ModalProps={{
                    BackdropProps: {
                        className: classes.backdrop,
                    },
                }}
                elevation={0}
                classes={{ paper: classes.paper }}>
                <Stack justifyContent="space-between" gap={2} height="100%" maxHeight="100%">
                    <Box overflow="auto">
                        {personas.map((item) => {
                            const { identifier, nickname, linkedProfiles } = item
                            const publicHexKey = identifier.publicKeyAsHex
                            if (!publicHexKey) return null
                            return (
                                <Box mb={2.5} key={identifier.toText()}>
                                    <PersonaCard
                                        publicKey={publicHexKey}
                                        identifier={identifier}
                                        active={identifier === currentPersonaIdentifier}
                                        nickname={nickname}
                                        profiles={[...linkedProfiles.values()]}
                                        onClick={() => onChangeCurrentPersona(identifier)}
                                    />
                                </Box>
                            )
                        })}
                        <Box className={classes.buttons}>
                            <Button
                                onClick={() => navigate(DashboardRoutes.SignUp)}
                                disabled={personas.length >= MAX_PERSONA_LIMIT}>
                                {t.personas_add_persona()}
                            </Button>
                            <Button
                                color="warning"
                                onClick={() =>
                                    navigate(DashboardRoutes.SignIn, { state: { from: DashboardRoutes.Personas } })
                                }>
                                {t.recovery()}
                            </Button>
                        </Box>
                    </Box>
                    <Box>
                        <Button
                            fullWidth
                            sx={{ mb: 2 }}
                            color="warning"
                            onClick={() => navigate(DashboardRoutes.Settings, { state: { open: 'setting' } })}>
                            {t.settings_global_backup_title()}
                        </Button>
                    </Box>
                </Stack>
            </Drawer>
        )
    },
)
