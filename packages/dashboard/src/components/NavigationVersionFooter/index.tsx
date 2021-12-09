import { MaskColorVar } from '@masknet/theme'
import { styled } from '@mui/system'
import { memo } from 'react'
import { useDashboardI18N } from '../../locales'

const VersionContainer = styled('div')(() => ({
    color: MaskColorVar.textSecondary,
    textAlign: 'center',
    fontSize: '12px',
}))

interface NavigationVersionFoorterProps extends React.PropsWithChildren<{}> {
    version?: string
}

export const NavigationVersionFoorter = memo((props: NavigationVersionFoorterProps) => {
    const t = useDashboardI18N()
    const version = props.version ?? '2.2.0'
    return <VersionContainer>{t.version_of_stable({ version })}</VersionContainer>
})
