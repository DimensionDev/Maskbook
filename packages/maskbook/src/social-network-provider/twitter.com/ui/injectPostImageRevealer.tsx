import { useEffect, useState, Component, MouseEvent } from 'React'
import { createStyles, makeStyles, Theme } from '@material-ui/core'
import { querySelectorAll } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { DOMProxy } from '@dimensiondev/holoflows-kit'
import { Flags } from '../../../utils/flags'

let buttonUrls = new Set<String>()

const heightAtHidden = '0px'
const heightAtShow = ''
const textAtHidden = 'SHOW ENCRYPTED IMAGE'
const textAtShow = 'HIDE ENCRYPTED IMAGE'

const useRevealEncryptionButtonStyles = makeStyles((theme: Theme) => {
    return createStyles({
        revealButton: {
            backgroundColor: 'transparent',
            width: '100%',
            color: theme.palette.text.primary,
        }
    })
})



function RevealEncryptionButton(props: { elem: HTMLElement }) {
    const classes = useRevealEncryptionButtonStyles()

    const [buttonText, setButtonText] = useState('SHOW ENCRYPTED IMAGE')
    const [isHidden, setIsHidden] = useState(false)
    const [height, setHeight] = useState('0px')

    const toggleElement = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        e.preventDefault()
        const newHidden = !isHidden
        setIsHidden(newHidden)

        if (newHidden) {
            // hide
            setHeight(heightAtHidden)
            setButtonText(textAtHidden)
        } else {
            // show
            setHeight(heightAtShow)
            setButtonText(textAtShow)

        }
    }

    useEffect(() => {
        props.elem.style.height = height
    });

    return (
        <button
            className={classes.revealButton}
            onClick={toggleElement}>
            {buttonText}
        </button>
    )
}

function getNParent(element: HTMLElement, n: number) {
    let p: HTMLElement = element
    for (let i = 0; i < n; i++) {
        if (!p.parentElement) return null
        p = p.parentElement
    }
    return p
}

export function injectPostImageRevealerAtTwitter(encryptedUrl: string) {
    // make sure button only gets injected once per image
    const stripped = encryptedUrl.split('?')[0]
    if (buttonUrls.has(stripped)) return
    buttonUrls.add(stripped)

    // create button
    const res = querySelectorAll(`img[src*="${stripped}"]`)
    res.map((element, idx, arr) => {
        const container = getNParent(element, 3)
        if (!container) return
        setTimeout(() => {
            const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
            proxy.realCurrent = container.parentElement
            renderInShadowRoot(<RevealEncryptionButton elem={container} />, { shadow: () => proxy.afterShadow })
        }, 500)

    }).evaluate()
}
