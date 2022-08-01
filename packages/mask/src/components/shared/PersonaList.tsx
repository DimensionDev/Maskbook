import { Icons } from '@masknet/icons'
import { Box, DialogContent, Stack, Typography } from '@mui/material'
import { EMPTY_LIST, formatPersonaFingerprint } from '@masknet/shared-base'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity } from '../DataSource/useActivatedUI'
// TODO: move to share
import { useConnectedPersonas } from '../../plugins/NextID/hooks/useConnectedPersonas'
import Services from '../../extension/service'
import { InjectedDialog } from '@masknet/shared'

interface PersonaListProps {
    open: boolean
    onClose(): void
}

export const PersonaList = ({ open, onClose }: PersonaListProps) => {
    // Should double check "current persona"
    const visitingPersonaIdentifier = useCurrentVisitingIdentity()
    const { value: personas = EMPTY_LIST, loading } = useConnectedPersonas()

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        return Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
    }, [visitingPersonaIdentifier])

    return open ? (
        <InjectedDialog disableTitleBorder open={open} maxWidth="sm" onClose={onClose} title="test">
            <DialogContent>
                <Stack>
                    {personas.map((x) => {
                        return (
                            <Stack key={x.persona.identifier.toText()} direction="row">
                                <Box flexGrow={0}>
                                    <Icons.MenuPersonasActive size={30} />
                                </Box>
                                <Stack flexGrow={1}>
                                    <Typography>{x.persona.nickname}</Typography>
                                    <Typography>
                                        {formatPersonaFingerprint(x.persona.identifier.rawPublicKey, 4)}
                                    </Typography>
                                </Stack>
                                <Stack flexGrow={0}>
                                    {currentPersona?.identifier.toText() === x.persona.identifier.toText() ? (
                                        <Icons.CheckCircle />
                                    ) : (
                                        <RadioButtonUncheckedIcon />
                                    )}
                                </Stack>
                            </Stack>
                        )
                    })}
                </Stack>
            </DialogContent>
        </InjectedDialog>
    ) : null
}
