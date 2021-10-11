import { styled, useTheme } from '@material-ui/core/styles'
import { FooterLine } from '../FooterLine'
import { Paper, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskBannerIcon, MaskNotSquareIcon } from '@masknet/icons'

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

export const ColumnLayout = ({ haveFooter = true, children }: ColumnLayoutProps) => {
    const { classes } = useStyles()
    const mode = useTheme().palette.mode

    return (
        <Container>
            <Content>
                <Paper className={classes.paper} variant="outlined">
                    <Typography>{mode === 'dark' ? <MaskBannerIcon /> : <MaskNotSquareIcon />}</Typography>
                    {children}
                </Paper>
                {haveFooter && <FooterLine />}
            </Content>
        </Container>
    )
}
