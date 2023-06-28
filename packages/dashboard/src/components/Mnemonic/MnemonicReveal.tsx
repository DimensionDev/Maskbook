import { styled, Grid, Typography, useTheme } from '@mui/material'

const WordCard = styled(Typography)(
    ({ theme }) => `
    padding: ${theme.spacing('9px', 1)};
    border-radius: 6px;
    color: ${theme.palette.maskColor.main};
    font-size: 14;
    background-color: ${theme.palette.maskColor.bg};
    display: flex;
    align-items: flex-start;
    align-self: stretch;
`,
)

export interface MnemonicRevealProps extends withClasses<'container' | 'wordCard' | 'text'> {
    words: string[]
    indexed?: boolean
    wordClass?: string
}

export function MnemonicReveal(props: MnemonicRevealProps) {
    const { words, indexed, wordClass } = props
    const theme = useTheme()
    return (
        <Grid container rowSpacing={'12px'} columnSpacing={'24px'}>
            {words.map((item, index) => (
                <Grid item xs={3} key={index}>
                    <WordCard className={wordClass}>
                        <Typography color={theme.palette.maskColor.third}>{indexed ? `${index + 1}. ` : ''}</Typography>
                        <Typography fontWeight={700} textAlign={'center'} flex={'1 0 0'}>
                            {item}
                        </Typography>
                    </WordCard>
                </Grid>
            ))}
        </Grid>
    )
}
