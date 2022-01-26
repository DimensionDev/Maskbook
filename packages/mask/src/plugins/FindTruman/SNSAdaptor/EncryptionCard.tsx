import { Alert, Box, Card, CardContent, Divider, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContext, useState } from 'react'
import { fetchClue } from '../Worker/apis'
import { FindTrumanContext } from '../context'
import { useAsync } from 'react-use'
import FlipCard from './FlipCard'
import type { ClueCondition } from '../types'
import { ClueConditionType } from '../types'

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
        card: {
            borderRadius: '6px',
            ':not(:last-child)': {
                marginBottom: '8px',
            },
            display: 'flex',
            flexDirection: 'column',
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
                                    onLoad={({ currentTarget }) => {
                                        setBackImgHeight(currentTarget.parentElement?.offsetHeight || 0)
                                    }}
                                    onClick={({ currentTarget }) => {
                                        setBackImgHeight(currentTarget.parentElement?.offsetHeight || 0)
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
                                    <ClueConditionCard
                                        cardHeight={backImgHeight}
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

interface ClueConditionCardProps {
    cardHeight: number
    onClick(): void
    conditions: ClueCondition
}

function ClueConditionCard(props: ClueConditionCardProps) {
    const { cardHeight, onClick, conditions } = props
    const { classes } = useStyles()
    const { t } = useContext(FindTrumanContext)

    return (
        <Card
            className={classes.card}
            variant="outlined"
            onClick={onClick}
            sx={{ height: cardHeight || 'auto', cursor: 'pointer' }}>
            <CardContent>
                <Typography variant="h6" component="div">
                    {t('plugin_find_truman_decrypt_tip')}
                </Typography>
                <Divider sx={{ margin: '8px 0' }} />
                <Box>
                    {conditions.conditions?.map((condition, index) => {
                        switch (condition.type) {
                            case ClueConditionType.Erc721:
                                return (
                                    <div key={index}>
                                        <Typography variant="body1" fontWeight="bold" color="text.primary" gutterBottom>
                                            {index + 1}. {condition.minAmount} {condition.name}
                                        </Typography>
                                    </div>
                                )
                            case ClueConditionType.Or:
                                return (
                                    condition.conditions && (
                                        <div key={index}>
                                            <Typography variant="body1" fontWeight="bold" color="text.primary">
                                                {index + 1}. {t('plugin_find_truman_decrypt_tip_community')}
                                            </Typography>
                                            <ul>
                                                {condition.conditions.map((c, index) => (
                                                    <li key={c.name}>
                                                        <Typography key={c.name} variant="body2" color="text.primary">
                                                            {c.minAmount} {c.name}
                                                        </Typography>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                )
                            default:
                                return null
                        }
                    })}
                </Box>
            </CardContent>
        </Card>
    )
}
