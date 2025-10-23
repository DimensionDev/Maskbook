import { Icons } from '@masknet/icons'
import { type PersonaInformation, formatPersonaFingerprint, type Wallet } from '@masknet/shared-base'
import { MaskColorVar, makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Stack, Typography, ListItem, List, Link } from '@mui/material'
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
    wallets: {
        gridGap: '12px 12px',
        display: 'grid',
        gridTemplateColumns: `repeat(${props.length > 1 ? 2 : 1}, 1fr)`,
        marginTop: 12,
        padding: 0,
    },
    wallet: {
        padding: '8px',
        display: 'flex',
        gap: 8,
        backgroundColor: MaskColorVar.primaryBackground2,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    link: {
        cursor: 'pointer',
        zIndex: 1,
        '&:hover': {
            textDecoration: 'none',
        },
        lineHeight: 0,
        marginLeft: 6,
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
        <>
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
        </>
    )
}
