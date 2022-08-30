import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { Icons } from '@masknet/icons'
import { PersonaSelectPanel } from '../../../../components/shared/ConnectPersonaSelect/PersonaSelectPanel'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'inline-flex',
        gap: theme.spacing(1),
        minWidth: 254,
        borderRadius: '50px',
    },
}))

interface CreatePersonaActionProps {
    disabled: boolean
    onCreate(): void
}

export const CreatePersonaAction = memo<CreatePersonaActionProps>(({ disabled, onCreate }) => {
    const t = useI18N()
    const { classes } = useStyles()
    return (
        <>
            <Stack>
                <Typography fontWeight={400} fontSize={14}>
                    {t.create_persona_intro()}
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center">
                <Button disabled={disabled} className={classes.button}>
                    <Icons.Identity size={18} sx={{ marginRight: '8px' }} />
                    {t.create_persona()}
                </Button>
            </Stack>
        </>
    )
})

export const SelectConnectPersonaAction = memo(() => {
    return (
        <Stack p={1.25} pb={0}>
            <PersonaSelectPanel />
        </Stack>
    )
})

interface AddWalletPersonaActionProps {
    disabled: boolean
    onAddWallet(): void
}

export const AddWalletPersonaAction = memo<AddWalletPersonaActionProps>(({ disabled, onAddWallet }) => {
    const t = useI18N()
    const { classes } = useStyles()
    return (
        <>
            <Stack>
                <Typography fontWeight={400} fontSize={14}>
                    {t.add_wallet_intro()}
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center">
                <Button variant="contained" onClick={onAddWallet} className={classes.button}>
                    <Icons.WalletUnderTabs size={16} />
                    {t.add_wallet_button()}
                </Button>
            </Stack>
        </>
    )
})

export const OtherLackWalletAction = memo(() => {
    const t = useI18N()
    return (
        <Stack justifyContent="center" alignItems="center" flex={1}>
            <Typography fontWeight={400} fontSize={14}>
                {t.others_lack_wallet()}
            </Typography>
        </Stack>
    )
})
