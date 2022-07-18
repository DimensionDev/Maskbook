import { Icon } from '@masknet/icons'
import { styled } from '@mui/material/styles'
import { memo } from 'react'
import { Container } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'

const LayoutContainer = styled('div')(
    ({ theme }) => `
    display: flex;
    position: absolute;
    height: 100%;
    width: 100%;
    background: ${MaskColorVar.primaryBackground}
`,
)

const LeftSide = styled('div')(({ theme }) => ({
    padding: theme.spacing(5),
    width: '30%',
    maxWidth: '400px',
    background: theme.palette.primary.main,
    [theme.breakpoints.down('md')]: {
        width: '25%',
        padding: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}))

const RightContent = styled('div')(
    ({ theme }) => `
    flex: 1;
    display: flex;
    justify-content: center;
    max-height: 100%;
    overflow: auto;
    background: transparent;
`,
)

interface RowLayoutProps extends React.PropsWithChildren<{}> {}

export const RowLayout = memo(({ children }: RowLayoutProps) => {
    return (
        <LayoutContainer>
            <LeftSide>
                <Icon type="maskBanner" />
            </LeftSide>
            <RightContent>
                <Container maxWidth="md">{children}</Container>
            </RightContent>
        </LayoutContainer>
    )
})
