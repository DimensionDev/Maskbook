import { experimentalStyled as styled } from '@material-ui/core/styles'
import { CreateWallet } from './CreateWallet'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`

export function StartUp() {
    return (
        <Container>
            <CreateWallet />
        </Container>
    )
}
