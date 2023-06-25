import { memo } from 'react'
import { MaskColorVar } from '@masknet/theme'
import { styled } from '@mui/system'
import { useDashboardI18N } from '../../locales/index.js'
import { useBuildInfo } from '@masknet/shared-base-ui'

const VersionContainer = styled('div')(() => ({
    color: MaskColorVar.textSecondary,
    textAlign: 'center',
    fontSize: '12px',
}))

export const NavigationVersionFooter = memo(() => {
    const t = useDashboardI18N()
    const env = useBuildInfo()
    const version = env.VERSION
    return <VersionContainer>{version ? version : t.version_of_stable({ version })}</VersionContainer>
})
