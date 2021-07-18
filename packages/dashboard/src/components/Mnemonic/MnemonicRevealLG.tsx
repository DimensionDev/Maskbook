import { experimentalStyled as styled, Typography } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'

const Container = styled('div')`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px 28px;
    & > * {
        min-width: 150px;
        min-height: 38px;
    }
`

const WordCard = styled(Typography)(
    ({ theme }) => `
    border-radius: 6px;
    color: ${theme.palette.mode === 'dark' ? MaskColorVar.textPrimary : MaskColorVar.primary}
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
        <Container>
            {words.map((item, index) => (
                <WordCard key={index + item}>{item}</WordCard>
            ))}
        </Container>
    )
}
