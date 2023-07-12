import { memo, useCallback } from 'react'
import { useDrop } from 'react-use'
import { MaskTextField, makeStyles } from '@masknet/theme'
import { Grid, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    input: {
        backgroundColor: theme.palette.maskColor.input,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        textAlign: 'center',
    },
    no: {
        color: theme.palette.maskColor.third,
        fontSize: 14,
    },
}))

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

export const DesktopMnemonicConfirm = memo(function DesktopMnemonicConfirm(props: DesktopMnemonicConfirmProps) {
    const { classes } = useStyles()
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
            {puzzleWords.map((word, i) => {
                const no = i + 1
                return (
                    <Grid item xs={3} key={i}>
                        <MaskTextField
                            sx={{ width: '100%', userSelect: 'none' }}
                            value={word}
                            InputProps={{
                                disableUnderline: true,
                                className: classes.input,
                                startAdornment: <Typography className={classes.no}>{no}.</Typography>,
                                inputProps: {
                                    style: {
                                        textAlign: 'center',
                                    },
                                },
                            }}
                            disabled={!!(indexes && !indexes.includes(i))}
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
                )
            })}
        </Grid>
    )
})
