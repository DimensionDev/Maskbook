import { MaskColorVar } from '@masknet/theme'
import { styled } from '@mui/system'
import { memo } from 'react'
import { useDashboardI18N } from '../../locales'

const VersionContainer = styled('div')(() => ({
    color: MaskColorVar.textSecondary,
    textAlign: 'center',
    fontSize: '12px',
}))

interface NavigationVersionFooterProps extends React.PropsWithChildren<{}> {
    version?: string
}

export const NavigationVersionFooter = memo((props: NavigationVersionFooterProps) => {
    const t = useDashboardI18N()
    const version = props.version ?? globalThis.browser?.runtime.getManifest()?.version ?? process.env.TAG_NAME.slice(1)
    return <VersionContainer>{version && t.version_of_stable({ version })}</VersionContainer>
})
