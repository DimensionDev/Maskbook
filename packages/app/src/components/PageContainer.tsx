import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { memo } from 'react'
import { DashboardHeader } from './DashboardHeader.js'
import { DashboardContainer } from './DashboardContainer.js'

interface PageContainerProps {
    children?: React.ReactNode
    title?: string
}

export const PageContainer = memo<PageContainerProps>(({ children, title = '' }) => {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title={title} />

                <div className="bg-white dark:bg-black p-5 pt-0">
                    <div className="border rounded-lg border-line-light dark:border-neutral-800 overflow-hidden">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>{children}</ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
})
