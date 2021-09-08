import { ChangeEvent, FC, useCallback, useState } from 'react'
import { Box, TextField } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useDebounce } from 'react-use'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../messages'

const useStyles = makeStyles()((theme) => ({
    walletName: {
        width: '100%',
    },
    textField: {
        width: '100%',
        minHeight: 97,
    },
}))

export interface RecoverResult {
    address: string
    privateKey: string
    privateKeyValid: boolean
}

interface FromPrivateKeyProps {
    onRecover: (result: RecoverResult) => void
}

export const FromPrivateKey: FC<FromPrivateKeyProps> = ({ onRecover }) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [valid, setValid] = useState(true)
    const [privateKey, setPrivateKey] = useState('')
    const handleChange = useCallback((evt: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const text = evt.target.value
        setPrivateKey(text)
    }, [])
    useDebounce(
        () => {
            if (!privateKey) {
                setValid(true)
                return
            }
            WalletRPC.recoverWalletFromPrivateKey(privateKey).then(({ address, privateKeyValid }) => {
                setValid(privateKeyValid)
                onRecover({
                    address,
                    privateKey,
                    privateKeyValid,
                })
            })
        },
        500,
        [privateKey],
    )

    return (
        <Box>
            <TextField
                className={classes.textField}
                multiline
                error={!valid}
                helperText={!valid ? t('plugin_wallet_import_private_key_invalid_warning') : ''}
                placeholder={t('plugin_wallet_import_private_key_placeholder')}
                value={privateKey}
                onChange={handleChange}
            />
        </Box>
    )
}
