import { TextField, experimentalStyled as styled } from '@material-ui/core'
import { memo } from 'react'

const Container = styled('div')({
    display: 'inline-grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    '& > *': {
        width: 124,
        height: 48,
    },
})

export interface DesktopMnemonicConfirmProps {
    words: string[]
    indexes: number[]
    onUpdateAnswerWords: (word: string, index: number) => void
}
export const DesktopMnemonicConfirm = memo<DesktopMnemonicConfirmProps>(({ words, indexes, onUpdateAnswerWords }) => {
    return (
        <Container>
            {words.map((word, index) => (
                <TextField
                    key={index}
                    size="small"
                    value={word}
                    autoFocus={indexes.sort((a, z) => a - z).indexOf(index) === 0}
                    disabled={!indexes.includes(index)}
                    variant="filled"
                    onChange={(ev) => onUpdateAnswerWords(ev.target.value, indexes.indexOf(index))}>
                    word
                </TextField>
            ))}
        </Container>
    )
})
