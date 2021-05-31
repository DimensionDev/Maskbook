import type { FC } from 'react'
import { Box, Card, makeStyles, TextField, Typography } from '@material-ui/core'
import classNames from 'classnames'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles((theme) => ({
    bottom: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(4, 0, 0),
    },
    description: {},
    card: {
        position: 'relative',
        minHeight: 140,
        display: 'flex',
        flexFlow: 'row wrap',
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
    },
    cardTextfield: {
        justifyContent: 'space-between',
    },
    word: {
        width: 101,
        minWidth: 101,
        whiteSpace: 'nowrap',
        marginTop: theme.spacing(2),
    },
    wordTextfield: {
        width: 110,
    },
}))

interface StepVerifyProps {
    wordsMatched: boolean
    puzzleWords: string[]
    indexes: number[]
    onBack: () => void
    onUpdateAnswerWords: (word: string, index: number) => void
    onSubmit: () => void
}

export const StepVerify: FC<StepVerifyProps> = ({
    wordsMatched,
    puzzleWords,
    indexes,
    onBack,
    onUpdateAnswerWords,
    onSubmit,
}) => {
    const classes = useStyles()
    const { t } = useI18N()
    return (
        <Box>
            <Typography className={classes.description}>{t('plugin_wallet_setup_description_verify')}</Typography>

            <Card className={classNames(classes.card, classes.cardTextfield)} elevation={0}>
                {puzzleWords.map((word, i) => (
                    <TextField
                        className={classNames(classes.word, classes.wordTextfield)}
                        key={i}
                        size="small"
                        value={word}
                        autoFocus={indexes.sort((a, z) => a - z).indexOf(i) === 0}
                        disabled={!indexes.includes(i)}
                        variant="outlined"
                        onChange={(ev) => onUpdateAnswerWords(ev.target.value, indexes.indexOf(i))}>
                        {word}
                    </TextField>
                ))}
            </Card>
            <Box className={classes.bottom}>
                <ActionButton
                    fullWidth
                    color="primary"
                    variant="text"
                    onClick={onBack}
                    style={{
                        marginRight: 16,
                    }}>
                    {t('plugin_wallet_setup_back')}
                </ActionButton>
                <ActionButton variant="contained" fullWidth disabled={!wordsMatched} onClick={onSubmit}>
                    {t('plugin_wallet_setup_verify')}
                </ActionButton>
            </Box>
        </Box>
    )
}
