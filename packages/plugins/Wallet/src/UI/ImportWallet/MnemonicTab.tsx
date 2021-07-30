import { Card, makeStyles, TextField } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    card: {
        position: 'relative',
        minHeight: 140,
        display: 'flex',
        flexFlow: 'row wrap',
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
        borderRadius: 0,
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

interface MnemonicTabProps {
    words: readonly string[]
    onChange: (words: string[]) => void
}

export function MnemonicTab({ words, onChange }: MnemonicTabProps) {
    const classes = useStyles()

    const handleChange = (newWord: string, index: number) => {
        const newWords = words.map((word, i) => {
            return i === index ? newWord : word
        })
        onChange(newWords)
    }

    return (
        <Card className={[classes.card, classes.cardTextfield].join(' ')} elevation={0}>
            {words.map((word, i) => (
                <TextField
                    className={[classes.word, classes.wordTextfield].join(' ')}
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
