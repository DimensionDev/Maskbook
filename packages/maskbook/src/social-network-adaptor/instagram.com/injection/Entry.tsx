import { Fab, styled } from '@material-ui/core'
import { Create } from '@material-ui/icons'
import { Composition } from '../../../components/CompositionDialog/Composition'
import { useState, useEffect } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { MaskMessage } from '../../../utils'

const Container = styled('div')`
    position: fixed;
    right: 2.5em;
    bottom: 5em;
`
const appearsWith = '[data-testid="new-post-button"]'
export function Entry() {
    const [display, setDisplay] = useState(!!document.querySelector(appearsWith))
    useEffect(() => {
        const watch = new MutationObserverWatcher(
            new LiveSelector().querySelector(appearsWith).enableSingleMode(),
        ).startWatch({
            childList: true,
            subtree: true,
        })
        watch.on('onAdd', () => setDisplay(true))
        watch.on('onRemove', () => setDisplay(false))
        return () => watch.stopWatch()
    })
    if (!display) return null
    return (
        <Container>
            <Fab
                variant="extended"
                onClick={() => {
                    MaskMessage.events.requestComposition.sendToLocal({ open: true, reason: 'timeline' })
                }}>
                <Create />
                Create with Mask
            </Fab>
            <Composition type="timeline" />
        </Container>
    )
}
