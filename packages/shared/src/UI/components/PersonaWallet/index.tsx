import { Icons } from '@masknet/icons'
import { type PersonaInformation, formatPersonaFingerprint, type Wallet } from '@masknet/shared-base'
import { MaskColorVar, makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Stack, Typography } from '@mui/material'
import { FormattedAddress } from '../../../index.js'

const useWalletsStyles = makeStyles<{ length: number }>()((theme, props) => ({
    persona: {
        padding: '8px 16px',
        display: 'flex',
        gap: 20,
        backgroundColor: MaskColorVar.primaryBackground2,
        borderRadius: 8,
    },
    nickname: {
        lineHeight: '16px',
        fontWeight: 600,
        fontSize: 14,
        color: theme.palette.maskColor.primary,
    },
    finger: {
        lineHeight: '16px',
        fontWeight: 400,
        fontSize: 12,
        color: theme.palette.maskColor.primary,
    },
}))

interface ManageWalletProps {
    manageWallets: Wallet[]
    persona?: PersonaInformation
    name?: string
    address?: string
}

export function ManageWallet({ manageWallets, persona, name, address }: ManageWalletProps) {
    const { classes } = useWalletsStyles({ length: manageWallets.length })

    return (
        <Box className={classes.persona}>
            <Box>
                <Icons.Masks />
            </Box>
            <Stack justifyContent="center">
                <Typography variant="body1" className={classes.nickname}>
                    {persona?.nickname || name}
                </Typography>
                <Typography variant="caption" className={classes.finger}>
                    {persona?.identifier.rawPublicKey ?
                        formatPersonaFingerprint(persona.identifier.rawPublicKey || '')
                    :   <FormattedAddress address={address} size={10} formatter={formatEthereumAddress} />}
                </Typography>
            </Stack>
        </Box>
    )
}
