import { Icons } from '@masknet/icons'
import {
    formatPersonaFingerprint,
    isSamePersona,
    type ECKeyIdentifier,
    type PersonaInformation,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import { CopyButton } from '../CopyButton/index.js'
import { EmojiAvatar } from '../EmojiAvatar/index.js'

export interface PersonaItem {
    persona: PersonaInformation
    avatar?: string
}

interface PersonaItemProps extends withClasses<'checked' | 'unchecked'> {
    data: PersonaItem
    onClick: () => void
    currentPersona?: PersonaItem
    currentPersonaIdentifier?: ECKeyIdentifier
}

const useStyles = makeStyles()((theme) => {
    return {
        nickname: {
            fontSize: 16,
            lineHeight: '20px',
            color: theme.palette.maskColor.main,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        fingerprint: {
            fontSize: 12,
            lineHeight: '16px',
            color: theme.palette.maskColor.second,
        },
        indicator: {
            display: 'inline-block',
            background: '#2DDF00',
            borderRadius: '50%',
            width: 7,
            height: 7,
            position: 'absolute',
            left: '77.62%',
            right: '5.84%',
            top: '5.84%',
            bottom: '77.62%',
            border: `1px solid ${theme.palette.maskColor.bottom}`,
        },
    }
})

export function PersonaItemUI(props: PersonaItemProps) {
    const { data, onClick, currentPersona, currentPersonaIdentifier } = props
    const { classes } = useStyles(undefined, { props })

    return (
        <Stack direction="row" onClick={onClick} sx={{ alignItems: 'center', gap: 1 }}>
            <Box sx={{ flexGrow: 0, position: 'relative' }}>
                {data.avatar ?
                    <Avatar
                        src={data.avatar}
                        sx={{
                            width: 30,
                            height: 30,
                            display: 'inline-block',
                            borderRadius: '50%',
                        }}
                    />
                :   <EmojiAvatar value={data.persona.identifier.publicKeyAsHex} />}
                {isSamePersona(currentPersonaIdentifier, data.persona) && <Box className={classes.indicator} />}
            </Box>
            <Stack sx={{ flexGrow: 1 }}>
                <Typography className={classes.nickname}>{data.persona.nickname}</Typography>
                <Typography className={classes.fingerprint}>
                    <Stack
                        component="span"
                        direction="row"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                        {formatPersonaFingerprint(data.persona.identifier.rawPublicKey, 4)}
                        <CopyButton size={14} text={data.persona.identifier.rawPublicKey} />
                    </Stack>
                </Typography>
            </Stack>
            <Stack sx={{ flexGrow: 0 }}>
                {isSamePersona(currentPersona?.persona, data.persona) ?
                    <Icons.CheckCircle size={20} className={classes.checked} />
                :   <Icons.RadioNo size={20} className={classes.unchecked} />}
            </Stack>
        </Stack>
    )
}
