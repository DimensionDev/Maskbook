import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react'
import { Box, TextField, makeStyles } from '@material-ui/core'
import { debounce } from 'lodash-es'
import { WalletRPC } from '../../messages'

const useStyles = makeStyles((theme) => ({
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
    const classes = useStyles()
    const [valid, setValid] = useState(true)
    const [recovering, setRecovering] = useState(false)
    const [privateKey, setPrivateKey] = useState('')
    const handleChange = useCallback((evt: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const text = evt.target.value
        console.log('text', text)
        setPrivateKey(text)
    }, [])
    useEffect(() => {
        debounce(() => {
            if (!privateKey) {
                setRecovering(false)
                setValid(true)
                return
            }
            setRecovering(true)
            WalletRPC.recoverWalletFromPrivateKey(privateKey)
                .then(({ address, privateKeyValid }) => {
                    console.log('valid', privateKeyValid)
                    setValid(privateKeyValid)
                    onRecover({
                        address,
                        privateKey,
                        privateKeyValid,
                    })
                })
                .finally(() => {
                    setRecovering(false)
                })
        }, 500)()
    }, [privateKey])

    return (
        <Box>
            <TextField
                className={classes.textField}
                multiline
                error={!valid}
                helperText={!valid ? 'The Private key is incorrect' : ''}
                placeholder="Input your private key"
                value={privateKey}
                onChange={handleChange}
            />
        </Box>
    )
}
