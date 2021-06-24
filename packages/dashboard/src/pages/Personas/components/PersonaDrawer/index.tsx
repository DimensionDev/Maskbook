import { memo, useState } from 'react'
import { Box, Button, Drawer, makeStyles } from '@material-ui/core'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { PersonaCard } from '../PersonaCard'
import { MaskColorVar } from '@masknet/theme'
import { AddPersonaCard } from '../AddPersonaCard'
import { useDashboardI18N } from '../../../../locales'
import type { PersonaIdentifier, PersonaInformation } from '@masknet/shared'

const useStyles = makeStyles((theme) => ({
    root: {
        // material-ui toolbar height
        top: `64px !important`,
    },
    paper: {
        // material-ui toolbar height
        top: `64px`,
        padding: theme.spacing(3.75, 3.75, 0, 3.75),
        background: MaskColorVar.suspensionBackground,
        '& > *': {
            marginTop: theme.spacing(1.5),
        },
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
        const classes = useStyles()

        const t = useDashboardI18N()

        const [showAddPersonaCard, setShowAddPersonaCard] = useState(false)

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
                classes={{ root: classes.root, paper: classes.paper }}>
                {personas.map((item) => {
                    const { identifier, nickname, linkedProfiles } = item
                    return (
                        <PersonaCard
                            identifier={identifier}
                            active={identifier.equals(currentPersonaIdentifier)}
                            key={identifier.toText()}
                            nickname={nickname}
                            profiles={[...linkedProfiles.values()]}
                            onClick={() => onChangeCurrentPersona(identifier)}
                        />
                    )
                })}
                {showAddPersonaCard && (
                    <AddPersonaCard onConfirm={onCreatePersona} onCancel={() => setShowAddPersonaCard(false)} />
                )}
                <Box className={classes.buttons}>
                    <Button onClick={() => setShowAddPersonaCard(true)}>{t.personas_add_persona()}</Button>
                    <Button color="warning">{t.personas_back_up()}</Button>
                </Box>
            </Drawer>
        )
    },
)
