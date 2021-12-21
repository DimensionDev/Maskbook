import { Alert, CardContent, Typography, Divider } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContext, useState } from 'react'
import { fetchClue } from '../Worker/apis'
import { FindTrumanContext } from '../context'
import NoNftCard from './NoNftCard'
import type { FindTrumanI18nFunction } from '../types'
import { EncryptionErrorType } from '../types'
import { useAsync } from 'react-use'
import FlipCard from './FlipCard'

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

const getEncryptionError = (t: FindTrumanI18nFunction, errorCode: string) => {
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
    const [flipped, setFlipped] = useState<boolean>(false)
    const [backImgHeight, setBackImgHeight] = useState<number>(0)

    const { value: clue, error } = useAsync(async () => {
        return clueId
            ? fetchClue(clueId, address)
            : { decrypted: false, condition: undefined, frontImg: '', backImg: '' }
    }, [clueId])

    return (
        <CardContent>
            {clue && (
                <>
                    <Typography variant="body1" color="text.secondary">
                        {t('plugin_find_truman_decrypted_by')}
                    </Typography>
                    <Divider sx={{ margin: '8px 0' }} />
                    <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 250 }}>
                            <FlipCard isFlipped={flipped}>
                                <img
                                    onLoad={({ target }) => {
                                        setBackImgHeight((target as HTMLElement).parentElement?.offsetHeight || 0)
                                    }}
                                    onClick={({ target }) => {
                                        setBackImgHeight((target as HTMLElement).parentElement?.offsetHeight || 0)
                                        backImgHeight && setFlipped(true)
                                    }}
                                    src={clue.backImg}
                                    style={{ width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                />
                                {clue.decrypted ? (
                                    <img
                                        onClick={() => setFlipped(false)}
                                        src={clue.frontImg}
                                        style={{ width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                    />
                                ) : clue.condition ? (
                                    <NoNftCard
                                        cardHeight={backImgHeight}
                                        sx={{ marginTop: 0 }}
                                        onClick={() => setFlipped(false)}
                                        conditions={[clue.condition]}
                                    />
                                ) : (
                                    <div />
                                )}
                            </FlipCard>
                        </div>
                    </CardContent>
                </>
            )}
            {error && <Alert severity="info">{getEncryptionError(t, error.message)}</Alert>}
        </CardContent>
    )
}
