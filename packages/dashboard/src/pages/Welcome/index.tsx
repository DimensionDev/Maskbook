import { Button } from '@material-ui/core'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'
import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'

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
    const navigate = useNavigate()
    const privacyPolicyURL = new URL('./en.html', import.meta.url).toString()

    useEffect(
        () => () => {
            const link = privacyPolicyElement()
            link && link.removeEventListener('click', handleLinkClick)
        },
        [],
    )

    const privacyPolicyElement = useMemo(
        () => () => iframeRef?.current?.contentWindow?.document.getElementById('link'),
        [iframeRef],
    )

    const handleIFrameLoad = () => {
        const link = privacyPolicyElement()
        link && link.addEventListener('click', handleLinkClick)
    }

    const handleLinkClick = useCallback(() => {
        console.log(RoutePaths.PrivacyPolicy)
        window.open(`next.html#${RoutePaths.PrivacyPolicy}`)
    }, [])

    return (
        <WelcomeUI
            iframeRef={iframeRef}
            privacyPolicyURL={privacyPolicyURL}
            iframeLoadHandler={handleIFrameLoad}
            agreeHandler={() => navigate(RoutePaths.Setup)}
        />
    )
}

interface WelcomeUIProps {
    privacyPolicyURL: string
    iframeRef: MutableRefObject<HTMLIFrameElement | null>
    iframeLoadHandler(): void
    agreeHandler(): void
}

const WelcomeUI: React.FC<WelcomeUIProps> = ({ privacyPolicyURL, iframeLoadHandler, agreeHandler, iframeRef }) => (
    <ColumnLayout>
        <Content>
            <IFrame ref={iframeRef} src={privacyPolicyURL} onLoad={iframeLoadHandler} />
            <ButtonGroup>
                <Button color="secondary">Cancel</Button>
                <Button color="primary" onClick={agreeHandler}>
                    Agree
                </Button>
            </ButtonGroup>
        </Content>
    </ColumnLayout>
)
