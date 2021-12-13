import { Alert, CardContent, Typography, Divider } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContext, useEffect, useState } from 'react'
import { fetchClue } from '../Worker/apis'
import { FindTrumanContext } from '../context'
import NoNftCard from './NoNftCard'
import type { FindTrumanI18nFunction, PuzzleCondition } from '../types'

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

const getEncryptionError = (t: FindTrumanI18nFunction, errorCode: number) => {
    switch (errorCode) {
        case 102:
            return t('plugin_find_truman_decrypt_102')
        case 1004:
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
    const [condition, setCondition] = useState<PuzzleCondition>()
    const [content, setContent] = useState<string>('')
    const [err, setErr] = useState<{
        code: number
        data: any
    }>()

    useEffect(() => {
        setErr(undefined)
        setCondition(undefined)
        if (!!clueId) {
            fetchClue(clueId, address)
                .then((res) => {
                    if (res.decrypted) {
                        setContent(res.content || '')
                    } else {
                        setCondition(res.condition)
                    }
                })
                .catch((error) => {
                    setErr(error)
                })
        }
    }, [clueId])

    return (
        <CardContent>
            {!!content && (
                <>
                    <Typography variant="body1" color="text.secondary">
                        {t('plugin_find_truman_decrypted_by')}
                    </Typography>
                    <Divider sx={{ margin: '8px 0' }} />
                    <CardContent>
                        <div dangerouslySetInnerHTML={{ __html: content }} className={classes.root} />
                    </CardContent>
                </>
            )}
            {condition && <NoNftCard conditions={[condition]} />}
            {err && <Alert severity="info">{getEncryptionError(t, err.code)}</Alert>}
        </CardContent>
    )
}
