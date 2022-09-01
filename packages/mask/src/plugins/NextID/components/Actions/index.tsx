import { makeStyles, MaskLightTheme } from '@masknet/theme'
import { memo } from 'react'
import { Button, Stack, ThemeProvider, Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { Icons } from '@masknet/icons'
import { PersonaSelectPanel } from '../../../../components/shared/PersonaSelectPanel/PersonaSelectPanel'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'inline-flex',
        gap: theme.spacing(1),
        minWidth: 254,
        borderRadius: '20px',
        background: theme.palette.maskColor.publicMain,
        color: theme.palette.maskColor.white,
    },
    unchecked: {
        color: theme.palette.maskColor.white,
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
            <Stack flex={1}>
                <Typography fontWeight={400} fontSize={14}>
                    {t.create_persona_intro()}
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center">
                <Button disabled={disabled} className={classes.button} onClick={onCreate}>
                    <Icons.Identity size={18} />
                    {t.create_persona()}
                </Button>
            </Stack>
        </>
    )
})

export const SelectConnectPersonaAction = memo(() => {
    const { classes } = useStyles()
    return (
        <ThemeProvider theme={MaskLightTheme}>
            <Stack p={1.25} pb={0} width="100%">
                <PersonaSelectPanel classes={{ unchecked: classes.unchecked }} />
            </Stack>
        </ThemeProvider>
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
