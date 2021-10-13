import { MaskTextField } from '@masknet/theme'
import { Grid } from '@material-ui/core'
import { memo } from 'react'

export interface DesktopMnemonicConfirmProps {
    puzzleWords: string[]
    indexes?: number[]
    onChange(word: string, index: number): void
}
export const DesktopMnemonicConfirm = memo((props: DesktopMnemonicConfirmProps) => {
    const { puzzleWords, indexes, onChange } = props

    return (
        <Grid container spacing={2}>
            {puzzleWords.map((word, i) => (
                <Grid item xs={3} key={i}>
                    <MaskTextField
                        sx={{ width: '100%', userSelect: 'none' }}
                        placeholder={i + 1 + '.'}
                        value={word}
                        InputProps={{ disableUnderline: true }}
                        disabled={indexes && !indexes.includes(i)}
                        onChange={(e) => onChange(e.target.value, indexes ? indexes.indexOf(i) : i)}
                    />
                </Grid>
            ))}
        </Grid>
    )
})
