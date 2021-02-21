import { Component, MouseEvent } from 'React'
import { querySelectorAll } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { DOMProxy } from '@dimensiondev/holoflows-kit'
import { Flags } from '../../../utils/flags'

let buttonUrls = new Set<String>()

class RevealEncryptedButton extends Component<{ elem: HTMLElement }, { isHidden: boolean, buttonText: string }> {
    constructor(props: { elem: HTMLElement }) {
        super(props)
        this.state = { isHidden: false, buttonText: 'SHOW ENCRYPTED IMAGE' }
        this.toggleElement()
    }

    toggleElement = (): void => {
        const newHidden = !this.state.isHidden
        this.setState({ isHidden: newHidden })
        if (newHidden) {
            // hide
            this.props.elem.style.height = '0px'
            this.setState({ buttonText: 'SHOW ENCRYPTED IMAGE' })
        } else {
            // show
            this.props.elem.style.height = ''
            this.setState({ buttonText: 'HIDE ENCRYPTED IMAGE' })
        }
    }

    render() {
        return (
            <button
                style={{ width: '100%', backgroundColor: "transparent", color: "rgba(29,161,242,1.00)" }}
                onClick={this.toggleElement}>
                {this.state.buttonText}
            </button>
        )
    }
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
            renderInShadowRoot(<RevealEncryptedButton elem={container} />, { shadow: () => proxy.afterShadow })
        }, 500)

    }).evaluate()
}
