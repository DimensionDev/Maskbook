import { styled, Grid, Typography } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'

const WordCard = styled(Typography)(
    ({ theme }) => `
    padding: ${theme.spacing(1)};
    border-radius: 6px;
    color: ${theme.palette.mode === 'dark' ? MaskColorVar.textPrimary : MaskColorVar.textLink};
    font-size: 14;
    background-color: ${MaskColorVar.blue.alpha(0.1)};
    display: flex;
    justify-content: center;
    align-items: center;
`,
)

export interface MnemonicRevealProps {
    words: string[]
    indexed?: boolean
    wordClass?: string
}

export function MnemonicReveal(props: MnemonicRevealProps) {
    const { words, indexed, wordClass } = props
    return (
        <Grid container spacing={2}>
            {words.map((item, index) => (
                <Grid item xs={3} key={index}>
                    <WordCard className={wordClass}>
                        {indexed ? `${index + 1}. ` : ''}
                        {item}
                    </WordCard>
                </Grid>
            ))}
        </Grid>
    )
}
