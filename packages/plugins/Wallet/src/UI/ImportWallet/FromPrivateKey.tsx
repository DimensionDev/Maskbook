import { Box, TextField, makeStyles } from '@material-ui/core'
import { useI18N } from '../../locales'

const useStyles = makeStyles({
    textField: {
        width: '100%',
        minHeight: 97,
    },
})
interface FromPrivateKeyProps {
    privateKey: string
    setPrivateKey(key: string): void
    valid: boolean
}

export function FromPrivateKey({ privateKey, setPrivateKey, valid }: FromPrivateKeyProps) {
    const classes = useStyles()
    const t = useI18N()

    return (
        <Box>
            <TextField
                className={classes.textField}
                multiline
                error={!valid}
                helperText={!valid ? t.wallet_import_private_key_invalid_warning() : ''}
                placeholder={t.wallet_import_private_key_placeholder()}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
            />
        </Box>
    )
}
