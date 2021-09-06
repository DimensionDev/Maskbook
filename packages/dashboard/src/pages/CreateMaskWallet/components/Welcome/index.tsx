import { memo, useEffect, useMemo, useRef } from 'react'
import { useAppearance } from '../../../Personas/api'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { WelcomeUI } from '../../../Welcome'

const Welcome = memo(() => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const mode = useAppearance()
    const navigate = useNavigate()

    const privacyPolicyURL = new URL('../../../Welcome/en.html', import.meta.url).toString()
    const privacyPolicyDocument = useMemo(() => () => iframeRef?.current?.contentWindow?.document, [iframeRef])

    const updateIFrameStyle = () => {
        const document = privacyPolicyDocument()
        if (!document) return

        const style = document.createElement('style')
        style.innerHTML = `
              h3, h6 { color: ${mode === 'dark' ? '#FFFFFF' : '#111432'}; }
              p { color: ${mode === 'dark' ? 'rgba(255, 255, 255, 0.8);' : '#7b8192'}; }
            `
        document.head?.appendChild(style)
    }

    const handleIFrameLoad = () => {
        updateIFrameStyle()

        const link = document.getElementById('link')
        link?.addEventListener('click', handleLinkClick)
    }

    const handleLinkClick = () => {
        window.open(`next.html#${RoutePaths.CreateMaskWalletForm}`)
    }

    useEffect(
        () => () => {
            const link = privacyPolicyDocument()?.getElementById('link')
            link?.removeEventListener('click', handleLinkClick)
        },
        [],
    )

    useEffect(() => {
        updateIFrameStyle()
    }, [mode])

    return (
        <WelcomeUI
            iframeRef={iframeRef}
            privacyPolicyURL={privacyPolicyURL}
            iframeLoadHandler={handleIFrameLoad}
            agreeHandler={() => navigate(RoutePaths.CreateMaskWalletForm)}
            cancelHandler={() => window.close()}
        />
    )
})

export default Welcome
