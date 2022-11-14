import type { FC, PropsWithChildren } from 'react'
import { PluginID } from '@masknet/shared-base'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { MaskPostExtraInfoWrapper } from '@masknet/shared'
import { base } from '../base.js'
import { Icons } from '@masknet/icons'

export const DecentralizedSearchPostExtraInfoWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <MaskPostExtraInfoWrapper
            open
            wrapperProps={{
                icon: <Icons.DecentralizedSearch size={24} />,
                borderRadius: '0px',
                margin: '0px',
            }}
            key={PluginID.DecentralizedSearch}
            title={<PluginI18NFieldRender field={base.name} pluginID={PluginID.DecentralizedSearch} />}
            publisher={
                base.publisher ? (
                    <PluginI18NFieldRender pluginID={PluginID.DecentralizedSearch} field={base.publisher.name} />
                ) : undefined
            }
            publisherLink={base.publisher?.link}>
            {children}
        </MaskPostExtraInfoWrapper>
    )
}
