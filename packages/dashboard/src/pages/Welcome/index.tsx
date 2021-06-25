import { Button, Typography } from '@material-ui/core'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout'
import { experimentalStyled as styled } from '@material-ui/core/styles'

const Content = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(1)} ${theme.spacing(8)};
`,
)

const Introduce = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(2)} 0;
`,
)

const Title = styled('div')(
    ({ theme }) => `
    text-align: center;
    padding: ${theme.spacing(3)} 0 0 0;
`,
)

const Subtitle = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(1)} 0;
`,
)

const Paragraph = styled(Typography)(
    ({ theme }) => `
    & > span {
        display: block;
        margin: ${theme.spacing(0.5)} 0
    }
`,
)

const ButtonGroup = styled('div')(
    ({ theme }) => `
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    width: 200px;
`,
)

export default function Welcome() {
    const navigate = useNavigate()

    return (
        <ColumnLayout>
            <Content>
                <Title>
                    <Typography variant="h3">Help Us Improve Mask Network</Typography>
                </Title>
                <Introduce>
                    <Typography variant={'body2'} paragraph>
                        Mask Network aims to build an encrypted and decentralized social network, you (all Internet
                        users) could send or browse encrypted posts with the ‘Mask Network’ extension or App.
                    </Typography>
                    <Typography variant={'body2'} paragraph>
                        Send encrypted red packets, purchase cryptocurrencies, share encrypted files, etc. More
                        functions are ready to be launched.
                    </Typography>
                    <Subtitle>
                        <Typography variant="h5">Mask Network never collects</Typography>
                    </Subtitle>
                    <Paragraph variant={'body2'} paragraph>
                        <span>
                            users’ accounts and passwords. Unless users authorized us to host accounts and passwords.
                        </span>
                        <span>users’ related information and browsing histories of their social accounts.</span>
                        <span>
                            users’ private keys, addresses, balances, purchase histories, hash, or any personal
                            information.
                        </span>
                        <span>users’ complete IP address.</span>
                    </Paragraph>
                    <Paragraph variant={'body2'} paragraph>
                        <span>
                            Mask Network keeps users’ encrypted information in users’ browser, please keep it safe and
                            make sure to back up constantly.
                        </span>
                        <span>Previous users of Mask Network are required to register with email accounts.</span>
                        <span>For more information about privacy protection, please read our privacy policy.</span>
                    </Paragraph>
                </Introduce>
                <ButtonGroup>
                    <Button color={'secondary'}>Cancel</Button>
                    <Button color={'primary'} onClick={() => navigate(RoutePaths.Setup)}>
                        Agree
                    </Button>
                </ButtonGroup>
            </Content>
        </ColumnLayout>
    )
}
