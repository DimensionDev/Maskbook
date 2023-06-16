import { makeStyles } from '@masknet/theme'
import { Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import { FooterLine } from '../FooterLine/index.js'
import { HeaderLine } from '../HeaderLine/index.js'

const Container = styled('div')(
    ({ theme }) => `
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing(4)};
    height: 100%;
    width: 100%;
`,
)

const Content = styled('div')(`
    width: 900px;
    max-height: 90%;
`)

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(6),
        marginBottom: theme.spacing(1),
    },
}))

interface ColumnLayoutProps extends React.PropsWithChildren<{}> {
    haveFooter?: boolean
}

export function ColumnLayout({ haveFooter = true, children }: ColumnLayoutProps) {
    const { classes } = useStyles()

    return (
        <Container>
            <Content>
                <Paper className={classes.paper} variant="outlined">
                    <HeaderLine />
                    {children}
                </Paper>
                {haveFooter ? <FooterLine /> : null}
            </Content>
        </Container>
    )
}
