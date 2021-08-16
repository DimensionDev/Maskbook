import { experimentalStyled as styled, Grid, Typography } from '@material-ui/core'
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

export interface MnemonicRevealLGProps {
    words: string[]
}

// TODO: merge in MnemonicReveal
export function MnemonicRevealLG(props: MnemonicRevealLGProps) {
    const { words } = props
    return (
        <Grid container spacing={2}>
            {words.map((item, index) => (
                <Grid item xs={3} key={index + item}>
                    <WordCard>{item}</WordCard>
                </Grid>
            ))}
        </Grid>
    )
}
