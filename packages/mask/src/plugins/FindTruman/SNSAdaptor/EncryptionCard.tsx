import { Alert, CardContent, Typography, Divider } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { fetchSecretKey } from '../Worker/apis'
import { FindTrumanContext } from '../context'
import NoNftCard from './NoNftCard'
import { useI18N } from '../../../utils'

interface EncryptionCardProps {
    payload: string
}
export default function EncryptionCard(props: EncryptionCardProps) {
    const { payload } = props

    const { t } = useI18N()
    const { address } = useContext(FindTrumanContext)
    const [failed, setFailed] = useState(false)
    const [message, setMessage] = useState('')
    const [err, setErr] = useState<{
        code: number
        data: any
    }>()

    useEffect(() => {
        setFailed(false)
        try {
            const raw = JSON.parse(Buffer.from(payload, 'base64').toString())
            if (!!raw.cid && !!raw.data) {
                fetchSecretKey(raw.cid, address)
                    .then(async (res) => {
                        setMessage(raw.data)
                    })
                    .catch((error) => {
                        setErr(error)
                    })
            }
        } catch (error) {
            setFailed(true)
        }
    }, [payload])

    return (
        <CardContent>
            {!!message && (
                <>
                    <Typography variant="body1" color="text.secondary">
                        {t('plugin_find_truman_decrypted_by')}
                    </Typography>
                    <Divider sx={{ margin: '8px 0' }} />
                    <Typography variant="h6" color="text.primary">
                        {message}
                    </Typography>
                </>
            )}
            {failed && <Alert severity="error">{t('plugin_find_truman_decrypted_failed')}</Alert>}
            {err && (
                <Alert severity="info" sx={{ mb: 1 }}>
                    {t('plugin_find_truman_decrypt_102')}
                </Alert>
            )}
            {err && err.data.type === 'erc721' && <NoNftCard conditions={[err.data]} />}
            {err && err.data.type === 'erc20' && (
                <Alert severity="info">
                    {t('plugin_find_truman_insufficient_erc20', { minAmount: err.data.minAmount })}
                </Alert>
            )}
        </CardContent>
    )
}
