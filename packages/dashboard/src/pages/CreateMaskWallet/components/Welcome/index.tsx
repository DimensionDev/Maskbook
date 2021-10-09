import { memo, MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { useAppearance } from '../../../Personas/api'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../../../type'
import { styled } from '@mui/material/styles'
import { useDashboardI18N } from '../../../../locales'
import { Button } from '@mui/material'
import { MaskNotSquareIcon } from '@masknet/icons'

const Content = styled('div')(
    ({ theme }) => `
    padding: 130px 120px 100px  120px;
    width: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`,
)

const ButtonGroup = styled('div')(
    ({ theme }) => `
    display: grid;
    grid-template-columns: repeat(2,1fr);
    padding: 33px 120px;
    gap: 10px;
    margin-top: 24px;
    width: 100%;
    max-width: 864px;
`,
)

const IFrame = styled('iframe')(
    ({ theme }) => `
    border: none;
    width: 100%;
    min-height: 412px;
    max-width: 864px;
`,
)

const StyledButton = styled(Button)(
    () => `
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    padding: 8px 16px;
    border-radius: 20px;
`,
)

const CancelButton = styled(Button)(
    ({ theme }) => `
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    padding: 8px 16px;
    border-radius: 20px;
    background: ${theme.palette.mode === 'dark' ? '#1A1D20' : '#F7F9FA'}
`,
)

const Welcome = memo(() => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const mode = useAppearance()
    const navigate = useNavigate()

    const privacyPolicyURL = new URL('../../en.html', import.meta.url).toString()
    const privacyPolicyDocument = useMemo(() => () => iframeRef?.current?.contentWindow?.document, [iframeRef])

    const updateIFrameStyle = () => {
        const iframeDocument = privacyPolicyDocument()
        if (!iframeDocument) return

        const style = iframeDocument.createElement('style')
        style.innerHTML = `
              h3, h6 { color: ${mode === 'dark' ? '#D4D4D4' : '#111432'}; }
              p { color: ${mode === 'dark' ? '#D4D4D4;' : '#7b8192'}; }
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
                <MaskNotSquareIcon style={{ width: 208, height: 60 }} />
                <IFrame ref={iframeRef} src={privacyPolicyURL} onLoad={iframeLoadHandler} />
                <ButtonGroup>
                    <CancelButton color="secondary" onClick={cancelHandler}>
                        {t.cancel()}
                    </CancelButton>
                    <StyledButton color="primary" onClick={agreeHandler}>
                        {t.agree()}
                    </StyledButton>
                </ButtonGroup>
            </Content>
        )
    },
)

export default Welcome
