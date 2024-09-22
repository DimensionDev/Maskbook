import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, Stack, Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { PersonaSelectPanel } from '@masknet/shared'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'inline-flex',
        gap: theme.spacing(1),
        minWidth: 254,
        borderRadius: '20px',
        width: 'fit-content !important',
    },
    unchecked: {
        '& circle': {
            stroke: theme.palette.maskColor.white,
        },
    },
}))

interface CreatePersonaActionProps {
    disabled: boolean
    onCreate(): void
}

export const CreatePersonaAction = memo<CreatePersonaActionProps>(({ disabled, onCreate }) => {
    const { classes, theme } = useStyles()

    return (
        <>
            <Stack flex={1} px={1.25} justifyContent="flex-start" width="100%" boxSizing="border-box">
                <Typography fontWeight={400} fontSize={14} color={theme.palette.maskColor.second}>
                    <Trans>Please create your persona to use Web3 Profile.</Trans>
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center" alignItems="center">
                <Button color="primary" disabled={disabled} className={classes.button} onClick={onCreate}>
                    <Icons.Identity size={18} />
                    <Trans>Create Persona</Trans>
                </Button>
            </Stack>
        </>
    )
})

export const SelectConnectPersonaAction = memo(() => {
    const { classes } = useStyles()
    return (
        <Stack p={1.25} pb={0} width="100%" boxSizing="border-box">
            <PersonaSelectPanel classes={{ unchecked: classes.unchecked, button: classes.button }} />
        </Stack>
    )
})

interface AddWalletPersonaActionProps {
    disabled: boolean
    onAddWallet(): void
}

export const AddWalletPersonaAction = memo<AddWalletPersonaActionProps>(({ onAddWallet }) => {
    const { classes, theme } = useStyles()
    return (
        <>
            <Stack flex={1} px={1.25} justifyContent="flex-start" width="100%" boxSizing="border-box">
                <Typography fontWeight={400} fontSize={14} color={theme.palette.maskColor.second}>
                    <Trans>
                        In the Web3 tab, you can show your wallet addresses for NFT collections, donation records, and
                        other on-chain feeds to friends who have also installed the Mask extension.
                    </Trans>
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center">
                <Button color="primary" variant="contained" onClick={onAddWallet} className={classes.button}>
                    <Icons.Wallet size={16} />
                    <Trans>Add wallet</Trans>
                </Button>
            </Stack>
        </>
    )
})

export const OtherLackWalletAction = memo(() => {
    const theme = useTheme()
    return (
        <Stack justifyContent="center" alignItems="center" flex={1}>
            <Typography fontWeight={400} fontSize={14} color={theme.palette.maskColor.second}>
                <Trans>The user has not set this.</Trans>
            </Typography>
        </Stack>
    )
})
