import { memo } from 'react'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { DashboardHeader } from './DashboardHeader.js'
import { DashboardContainer } from './DashboardContainer.js'
import { DashboardBody } from './DashboardBody.js'

interface PageContainerProps {
    children?: React.ReactNode
    title?: string
}

export const PageContainer = memo<PageContainerProps>(({ children, title = '' }) => {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title={title} />
                <DashboardBody>
                    <DisableShadowRootContext.Provider value={false}>
                        <ShadowRootIsolation>{children}</ShadowRootIsolation>
                    </DisableShadowRootContext.Provider>
                </DashboardBody>
            </main>
        </DashboardContainer>
    )
})
