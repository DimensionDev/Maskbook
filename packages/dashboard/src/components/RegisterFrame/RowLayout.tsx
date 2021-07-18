import { MaskBannerIcon } from '@masknet/icons'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { memo } from 'react'

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
    padding: 40px;
    background: ${theme.palette.primary.main};
`,
)

const RightContent = styled('div')(
    ({ theme }) => `
    width: 70%;
    background: ${theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.common};
`,
)

interface RowLayoutProps extends React.PropsWithChildren<{}> {}

export const RowLayout = memo(({ children }: RowLayoutProps) => {
    return (
        <Container>
            <LeftSide>
                <MaskBannerIcon />
            </LeftSide>
            <RightContent>{children}</RightContent>
        </Container>
    )
})
