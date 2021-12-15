import { Alert, CardContent, Typography, Divider } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContext } from 'react'
import { fetchClue } from '../Worker/apis'
import { FindTrumanContext } from '../context'
import NoNftCard from './NoNftCard'
import type { DecryptedClue, FindTrumanI18nFunction } from '../types'
import { EncryptionErrorType } from '../types'
import { useAsync } from 'react-use'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            color: 'inherit',
            fontSize: 'inherit',
            fontFamily: 'sans-serif',
            '& p': {
                margin: 0,
            },
            '& p + p': {
                marginTop: theme.spacing(0.5),
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontSize: 14,
            },
            '& img': {
                maxWidth: '100%',
            },
            '& a': {
                color: theme.palette.text.primary,
            },
        },
    }
})

const getEncryptionError = (t: FindTrumanI18nFunction, errorCode: EncryptionErrorType) => {
    switch (errorCode) {
        case EncryptionErrorType.INSUFFICIENT_NFT:
            return t('plugin_find_truman_decrypt_102')
        case EncryptionErrorType.ERROR_CLUE_ID:
            return t('plugin_find_truman_decrypt_1004')
        default:
            return ''
    }
}

interface EncryptionCardProps {
    clueId: string
}
export default function EncryptionCard(props: EncryptionCardProps) {
    const { clueId } = props

    const { classes } = useStyles()
    const { address, t } = useContext(FindTrumanContext)

    const { value: clue, error } = useAsync(async () => {
        let clue: DecryptedClue = { decrypted: false }
        if (!!clueId) {
            clue = await fetchClue(clueId, address)
        }
        return clue
    }, [clueId])

    return (
        <CardContent>
            {clue?.decrypted && (
                <>
                    <Typography variant="body1" color="text.secondary">
                        {t('plugin_find_truman_decrypted_by')}
                    </Typography>
                    <Divider sx={{ margin: '8px 0' }} />
                    <CardContent>
                        <div dangerouslySetInnerHTML={{ __html: clue.content || '' }} className={classes.root} />
                    </CardContent>
                </>
            )}
            {clue?.condition && <NoNftCard conditions={[clue.condition]} />}
            {error && <Alert severity="info">{getEncryptionError(t, (error as any).code)}</Alert>}
        </CardContent>
    )
}
