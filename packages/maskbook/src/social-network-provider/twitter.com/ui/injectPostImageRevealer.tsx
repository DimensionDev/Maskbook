import { useEffect, useState, Component, MouseEvent } from 'React'
import { createStyles, makeStyles, Theme } from '@material-ui/core'
import { querySelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { DOMProxy } from '@dimensiondev/holoflows-kit'
import { Flags } from '../../../utils/flags'
import type { PostInfo } from '../../../social-network/PostInfo'


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



function RevealEncryptionButton(props: { elem: HTMLElement, proxy: DOMProxy<HTMLElement, HTMLSpanElement, HTMLSpanElement> }) {
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

    return renderInShadowRoot(
        <button
            className={classes.revealButton}
            onClick={toggleElement}>
            {buttonText}
        </button>,
        {
            shadow: () => props.proxy.afterShadow
        }
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

// export function injectPostImageRevealerAtTwitter(encryptedUrl: string): void {
export function injectPostImageRevealerAtTwitter(current: PostInfo): () => void {
    /*
    const images = current.postMetadataImages
    if (images.size !== 1) return

    // have to loop since images = iterator
    for (const encryptedUrl in images) {
        const stripped = encryptedUrl.split('?')[0]
        if (buttonUrls.has(stripped)) return
        buttonUrls.add(stripped)

        const element = querySelector(`img[src*="${stripped}"]`, true).evaluate()
        if (!element) return
        const container = getNParent(element, 3)
        if (!container) return
        const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        proxy.realCurrent = container.parentElement

        // return (current: PostInfo) => RevealEncryptionButton({ current: current, proxy: proxy })
        return (current: PostInfo) => RevealEncryptionButton({
            elem: container,
            proxy: proxy
        })
    }

    return
    */

    console.log('REVEALER')

    const images = current.postMetadataImages
    if (images.size === 1) {
        // have to loop since images = iterator
        for (const encryptedUrl in images) {
            const stripped = encryptedUrl.split('?')[0]
            if (buttonUrls.has(stripped)) break
            buttonUrls.add(stripped)

            const element = querySelector(`img[src*="${stripped}"]`, true).evaluate()
            if (!element) break
            const container = getNParent(element, 3)
            if (!container) break
            const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
            proxy.realCurrent = container.parentElement

            // return (current: PostInfo) => RevealEncryptionButton({ current: current, proxy: proxy })
            return RevealEncryptionButton({
                elem: container,
                proxy: proxy
            })
        }
    }

    return () => { }
}
