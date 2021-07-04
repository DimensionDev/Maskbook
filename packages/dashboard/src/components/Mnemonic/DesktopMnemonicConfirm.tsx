import { TextField, experimentalStyled as styled } from '@material-ui/core'
import { memo } from 'react'

const Container = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    '& > *': {
        width: 124,
        height: 48,
    },
})

export interface DesktopMnemonicConfirmProps {
    puzzleWords: string[]
    indexes?: number[]
    onChange(word: string, index: number): void
}
export const DesktopMnemonicConfirm = memo((props: DesktopMnemonicConfirmProps) => {
    const { puzzleWords, indexes, onChange } = props

    return (
        <Container>
            {puzzleWords.map((word, i) => (
                <TextField
                    key={i}
                    label={i + 1 + '.'}
                    variant="filled"
                    size="small"
                    value={word}
                    disabled={indexes && !indexes.includes(i)}
                    onChange={(e) => onChange(e.target.value, indexes ? indexes.indexOf(i) : i)}
                />
            ))}
        </Container>
    )
})
