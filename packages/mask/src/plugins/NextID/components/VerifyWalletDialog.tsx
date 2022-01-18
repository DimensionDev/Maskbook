import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../locales'
import { makeStyles, MaskDialog } from '@masknet/theme'
import { MasksIcon } from '@masknet/icons'
import { formatFingerprint } from '@masknet/shared'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { useAccount } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '4px',
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    identifier: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
}))

interface VerifyWalletDialogProps {
    open: boolean
    onClose(): void
    identifier?: PersonaIdentifier
}

export const VerifyWalletDialog = memo<VerifyWalletDialogProps>(({ open, onClose, identifier }) => {
    const account = useAccount()
    const t = useI18N()
    const personas = useMyPersonas()
    const { classes } = useStyles()

    const { value: currentIdentifier } = useAsyncRetry(() => Services.Settings.getCurrentPersonaIdentifier(), [])
    const currentPersona = personas.find((x) => x.identifier.equals(currentIdentifier))
    const { value: message } = useAsyncRetry(() => {
        if (!currentIdentifier || !account) return Promise.resolve(null)
        return Services.Helper.createPersonaPayload(currentIdentifier, account, 'ethereum')
    }, [currentIdentifier])

    const handlePersonaSign = async () => {
        if (!message || !currentIdentifier) return
        const result = await Services.Identity.signWithPersona({
            method: 'eth',
            message: message,
            identifier: currentIdentifier.toText(),
        })
    }

    const handleWalletSign = async () => {
        if (!account || !message) return
        const result = await Services.Ethereum.personalSign(message, account)
    }

    // move to panel
    return (
        <MaskDialog
            DialogProps={{ scroll: 'paper' }}
            open={open}
            title={t.verify_wallet_dialog_title()}
            onClose={onClose}>
            <DialogContent style={{ minWidth: 515 }}>
                <div style={{ display: 'flex' }}>
                    <div className={classes.iconContainer}>
                        <MasksIcon />
                    </div>
                    <div>
                        <Typography className={classes.name}>{currentPersona?.nickname}</Typography>
                        <Typography className={classes.identifier}>
                            {formatFingerprint(currentPersona?.identifier.compressedPoint ?? '', 10)}
                        </Typography>
                    </div>
                </div>
                <WalletStatusBox />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handlePersonaSign}>
                    {t.persona_sign()}
                </Button>
                <Button variant="contained" onClick={handleWalletSign}>
                    {t.wallet_sign()}
                </Button>
            </DialogActions>
        </MaskDialog>
    )
})
