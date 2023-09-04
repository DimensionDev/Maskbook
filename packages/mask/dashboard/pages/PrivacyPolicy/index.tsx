import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout.js'
import { useLanguage } from '../Personas/api.js'
import { styled } from '@mui/material/styles'

const IFrame = styled('iframe')`
    border: none;
    width: 100%;
    min-height: 520px;
`

const PRIVACY_POLICY_PAGE_MAPPING: Record<string, string> = {
    'zh-TW': new URL('./zh.html', import.meta.url).toString(),
    en: new URL('./en.html', import.meta.url).toString(),
}

function PrivacyPolicy() {
    // todo: fix language is auto
    const lang = useLanguage()
    const privacyPolicyURL = PRIVACY_POLICY_PAGE_MAPPING[lang] ?? PRIVACY_POLICY_PAGE_MAPPING.en

    return (
        <ColumnLayout haveFooter={false}>
            <IFrame src={privacyPolicyURL} />
        </ColumnLayout>
    )
}

export default PrivacyPolicy
