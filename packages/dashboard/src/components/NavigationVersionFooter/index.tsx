import { MaskColorVar } from '@masknet/theme'
import { styled } from '@mui/system'
import { memo } from 'react'
import { useDashboardI18N } from '../../locales'

const VersionContainer = styled('div')(() => ({
    color: MaskColorVar.textSecondary,
    textAlign: 'center',
    fontSize: '12px',
}))

export const NavigationVersionFooter = memo(() => {
    const t = useDashboardI18N()
    const version = globalThis.browser?.runtime.getManifest()?.version ?? process.env.VERSION
    return <VersionContainer>{version && t.version_of_stable({ version })}</VersionContainer>
})
