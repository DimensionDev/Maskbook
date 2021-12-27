import { Alert, CardContent, Typography, Divider } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContext, useState } from 'react'
import { fetchClue } from '../Worker/apis'
import { FindTrumanContext } from '../context'
import NoNftCard from './NoNftCard'
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

interface EncryptionCardProps {
    clueId: string
}
export default function EncryptionCard(props: EncryptionCardProps) {
    const { clueId } = props

    const { classes } = useStyles()
    const { address, t } = useContext(FindTrumanContext)
    const [flipped, setFlipped] = useState(false)
    const [backImgHeight, setBackImgHeight] = useState(0)

    const { value: clue, error } = useAsync(async () => {
        return clueId
            ? fetchClue(clueId, address)
            : { decrypted: false, conditions: undefined, frontImg: '', backImg: '' }
    }, [clueId, address])

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
                                ) : clue.conditions ? (
                                    <NoNftCard
                                        cardHeight={backImgHeight}
                                        sx={{ marginTop: 0 }}
                                        onClick={() => setFlipped(false)}
                                        conditions={clue.conditions}
                                    />
                                ) : null}
                            </FlipCard>
                        </div>
                    </CardContent>
                </>
            )}
            {error && <Alert severity="info">{t('plugin_find_truman_decrypt_error_clue_id')}</Alert>}
        </CardContent>
    )
}
