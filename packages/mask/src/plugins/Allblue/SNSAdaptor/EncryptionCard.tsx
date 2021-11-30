import { Alert, CardContent, Typography, Divider } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { fetchSecretKey } from '../Worker/apis'
import { AllblueContext } from '../context'
import NoNftCard from './NoNftCard'
import { useI18N } from '../../../utils'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

interface EncryptionCardProps {
    payload: string
}
export default function EncryptionCard(props: EncryptionCardProps) {
    const { payload } = props

    const { t } = useI18N()
    const { address } = useContext(AllblueContext)
    const [failed, setFailed] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
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
                        // const {key, iv} = res
                        // const pwUtf8 = new TextEncoder().encode(key);
                        // const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
                        // const alg = { name: 'AES-GCM', iv: new TextEncoder().encode(iv) };
                        // const mKey = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
                        // const result = await crypto.subtle.decrypt(alg, mKey, new TextEncoder().encode(message))
                        setMessage(raw.data)
                    })
                    .catch((e) => {
                        setErr(e)
                    })
            }
        } catch (e) {
            setFailed(true)
        }
    }, [payload])

    return (
        <CardContent>
            {!address && (
                <Alert icon={false} severity="info" sx={{ justifyContent: 'center', textAlign: 'center' }}>
                    <EthereumChainBoundary noSwitchNetworkTip={true} chainId={1} />
                </Alert>
            )}
            {!!message && (
                <>
                    <Typography variant={'body1'} color={'text.secondary'}>
                        {t('plugin_allblue_decrypted_by')}
                    </Typography>
                    <Divider sx={{ margin: '8px 0' }} />
                    <Typography variant={'h6'} color={'text.primary'}>
                        {message}
                    </Typography>
                </>
            )}
            {failed && <Alert severity="error">{t('plugin_allblue_decrypted_failed')}</Alert>}
            {err && (
                <Alert severity="info" sx={{ mb: 1 }}>
                    {t('plugin_allblue_decrypt_102')}
                </Alert>
            )}
            {err && err.data.type === 'erc721' && <NoNftCard conditions={[err.data]} />}
            {err && err.data.type === 'erc20' && (
                <Alert severity="info">
                    {t('plugin_allblue_insufficient_erc20', { minAmount: err.data.minAmount })}
                </Alert>
            )}
        </CardContent>
    )
}
