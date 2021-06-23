import { experimentalStyled as styled } from '@material-ui/core/styles'
import { MaskNotSquareIcon } from '@masknet/icons'

const Container = styled('div')(
    ({ theme }) => `
    display: flex;
    position: absolute;
    height: 100%;
    width: 100%;
`,
)

const LeftSide = styled('div')(
    ({ theme }) => `
    width: 30%;
    background: ${theme.palette.mode === 'dark' ? theme.palette.text : theme.palette.primary.main};
`,
)

const RightContent = styled('div')(
    ({ theme }) => `
    width: 70%;
    background: ${theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.common};
`,
)

export const RowLayout: React.FC<{}> = ({ children }) => {
    return (
        <Container>
            <LeftSide>
                <MaskNotSquareIcon />
            </LeftSide>
            <RightContent>{children}</RightContent>
        </Container>
    )
}
