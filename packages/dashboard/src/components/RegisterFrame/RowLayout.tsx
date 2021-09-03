import { MaskBannerIcon } from '@masknet/icons'
import { styled } from '@material-ui/core/styles'
import { memo } from 'react'
import { LightColor } from '@masknet/theme/constants'
import { Container } from '@material-ui/core'

const LayoutContainer = styled('div')(
    ({ theme }) => `
    display: flex;
    position: absolute;
    height: 100%;
    width: 100%;
`,
)

const LeftSide = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(5)};
    width: 30%;
    max-width: 500px;
    background: ${theme.palette.primary.main};
`,
)

const RightContent = styled('div')(
    ({ theme }) => `
    flex: 1;
    display: flex;
    justify-content: center;
    background: ${theme.palette.mode === 'dark' ? LightColor.textPrimary : theme.palette.common};
`,
)

interface RowLayoutProps extends React.PropsWithChildren<{}> {}

export const RowLayout = memo(({ children }: RowLayoutProps) => {
    return (
        <LayoutContainer>
            <LeftSide>
                <MaskBannerIcon />
            </LeftSide>
            <RightContent>
                <Container maxWidth="md">{children}</Container>
            </RightContent>
        </LayoutContainer>
    )
})
