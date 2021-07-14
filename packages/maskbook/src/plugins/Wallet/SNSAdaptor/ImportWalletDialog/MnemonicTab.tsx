import type { FC } from 'react'
import { Card, makeStyles, TextField } from '@material-ui/core'
import classNames from 'classnames'

const useStyles = makeStyles((theme) => ({
    card: {
        position: 'relative',
        minHeight: 140,
        display: 'flex',
        flexFlow: 'row wrap',
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
    },
    cardButton: {
        padding: theme.spacing(1, 2, 3),
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.grey[50],
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
    wordButton: {
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.common.white,
    },
    wordTextfield: {
        width: 110,
    },
}))

interface MnemonicTabProps {
    words: string[]
    onChange: (words: string[]) => void
}

export const MnemonicTab: FC<MnemonicTabProps> = ({ words, onChange }) => {
    const classes = useStyles()

    const handleChange = (newWord: string, index: number) => {
        const newWords = words.map((word, i) => {
            return i === index ? newWord : word
        })
        onChange(newWords)
    }

    return (
        <Card className={classNames(classes.card, classes.cardTextfield)} elevation={0}>
            {words.map((word, i) => (
                <TextField
                    className={classNames(classes.word, classes.wordTextfield)}
                    placeholder={String(i + 1)}
                    key={i}
                    size="small"
                    value={word}
                    autoFocus={i === 0}
                    variant="outlined"
                    onChange={(ev) => handleChange(ev.target.value, i)}>
                    {word}
                </TextField>
            ))}
        </Card>
    )
}
