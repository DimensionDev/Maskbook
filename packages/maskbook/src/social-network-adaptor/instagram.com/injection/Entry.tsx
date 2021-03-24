import { Fab, experimentalStyled as styled } from '@material-ui/core'
import { Create } from '@material-ui/icons'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { useState } from 'react'

const Container = styled('div')`
    position: fixed;
    right: 2.5em;
    bottom: 5em;
`
export function Entry() {
    const open = useState(false)
    console.log(open)
    return (
        <Container>
            <Fab variant="extended" onClick={() => open[1](true)}>
                <Create />
                Create with Mask
            </Fab>
            <PostDialog open={open} />
        </Container>
    )
}
