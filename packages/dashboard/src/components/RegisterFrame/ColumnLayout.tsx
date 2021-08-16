import { experimentalStyled as styled } from '@material-ui/core/styles'
import { FooterLine } from '../FooterLine'
import { makeStyles, Paper, Typography } from '@material-ui/core'
import { MaskBannerIcon, MaskNotSquareIcon } from '@masknet/icons'
import { useAppearance } from '../../pages/Personas/api'

const Container = styled('div')(
    ({ theme }) => `
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`,
)

const Content = styled('div')(
    ({ theme }) => `
    width: 950px;
`,
)

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(6),
        marginBottom: theme.spacing(1),
    },
}))

interface ColumnLayoutProps extends React.PropsWithChildren<{}> {}

export const ColumnLayout = ({ children }: ColumnLayoutProps) => {
    const classes = useStyles()
    const mode = useAppearance()

    return (
        <Container>
            <Content>
                <Paper className={classes.paper} variant="outlined">
                    <Typography>{mode === 'dark' ? <MaskBannerIcon /> : <MaskNotSquareIcon />}</Typography>
                    {children}
                </Paper>
                <FooterLine />
            </Content>
        </Container>
    )
}
