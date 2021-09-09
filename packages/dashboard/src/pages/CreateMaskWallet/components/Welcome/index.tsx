import { Button } from '@material-ui/core'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { styled } from '@material-ui/core/styles'
import { memo, MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { useAppearance } from '../../../Personas/api'
import { useDashboardI18N } from '../../../../locales'

const Content = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(1)} ${theme.spacing(8)};
`,
)

const ButtonGroup = styled('div')(
    ({ theme }) => `
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    width: 180px;
`,
)

const IFrame = styled('iframe')(
    ({ theme }) => `
    border: none;
    width: 100%;
    min-height: 520px;
`,
)

export default function Welcome() {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const mode = useAppearance()
    const navigate = useNavigate()

    const agreementContentPageURL = new URL(`../../en.html`, import.meta.url).toString()
    const privacyPolicyDocument = useMemo(() => () => iframeRef?.current?.contentWindow?.document, [iframeRef])

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

    const updateIFrameStyle = () => {
        const iframeDocument = privacyPolicyDocument()
        if (!iframeDocument) return

        const style = iframeDocument.createElement('style')
        style.innerHTML = `
              h3, h6 { color: ${mode === 'dark' ? '#FFFFFF' : '#111432'}; }
              p { color: ${mode === 'dark' ? 'rgba(255, 255, 255, 0.8);' : '#7b8192'}; }
            `
        iframeDocument.head?.appendChild(style)
    }

    const handleIFrameLoad = () => {
        updateIFrameStyle()

        const iframeDocument = privacyPolicyDocument()
        if (!iframeDocument) return

        const link = iframeDocument.getElementById('link')
        link?.addEventListener('click', handleLinkClick)
    }

    const handleLinkClick = () => {
        window.open(`next.html#${RoutePaths.PrivacyPolicy}`)
    }

    return (
        <WelcomeUI
            iframeRef={iframeRef}
            privacyPolicyURL={agreementContentPageURL}
            iframeLoadHandler={handleIFrameLoad}
            agreeHandler={() => navigate(RoutePaths.CreateMaskWalletForm)}
            cancelHandler={() => window.close()}
        />
    )
}

interface WelcomeUIProps {
    privacyPolicyURL: string
    iframeRef: MutableRefObject<HTMLIFrameElement | null>
    iframeLoadHandler(): void
    agreeHandler(): void
    cancelHandler(): void
}

export const WelcomeUI = memo(
    ({ privacyPolicyURL, iframeLoadHandler, agreeHandler, cancelHandler, iframeRef }: WelcomeUIProps) => {
        const t = useDashboardI18N()
        return (
            <Content>
                <IFrame ref={iframeRef} src={privacyPolicyURL} onLoad={iframeLoadHandler} />
                <ButtonGroup>
                    <Button color="secondary" onClick={cancelHandler}>
                        {t.cancel()}
                    </Button>
                    <Button color="primary" onClick={agreeHandler}>
                        {t.agree()}
                    </Button>
                </ButtonGroup>
            </Content>
        )
    },
)
