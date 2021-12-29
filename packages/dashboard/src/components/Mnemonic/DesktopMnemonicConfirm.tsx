import { MaskTextField } from '@masknet/theme'
import { Grid } from '@mui/material'
import { memo, useCallback } from 'react'
import { useDrop } from 'react-use'

export interface DesktopMnemonicConfirmProps {
    puzzleWords: string[]
    indexes?: number[]
    onChange(word: string, index: number): void
    setAll?(words: string[]): void
}

const parserPastingAllMnemonic = (text: string) => {
    const result = [...text.matchAll(/([a-z])+/g)]
    return result.length === 12 ? result : null
}

export const DesktopMnemonicConfirm = memo((props: DesktopMnemonicConfirmProps) => {
    const { puzzleWords, indexes, onChange, setAll } = props
    useDrop({ onText: (text) => handlePaster(text) })

    const handlePaster = useCallback(
        (text: string) => {
            if (!setAll) return

            const words = parserPastingAllMnemonic(text)
            if (!words) return
            setAll(words.map((x) => x[0]))
        },
        [setAll],
    )

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
                        onChange={(e) => {
                            const text = e.target.value
                            if (
                                (e.nativeEvent as InputEvent).inputType === 'insertFromPaste' &&
                                parserPastingAllMnemonic(text)
                            ) {
                                return
                            }
                            onChange(text, indexes ? indexes.indexOf(i) : i)
                        }}
                    />
                </Grid>
            ))}
        </Grid>
    )
})
