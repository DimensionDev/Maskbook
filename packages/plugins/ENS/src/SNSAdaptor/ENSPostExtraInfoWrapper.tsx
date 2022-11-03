import type { FC, PropsWithChildren } from 'react'
import { PluginID } from '@masknet/shared-base'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { MaskPostExtraInfoWrapper } from '@masknet/shared'
import { base } from '../base.js'
import { Icons } from '@masknet/icons'

export const ENSPostExtraInfoWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <MaskPostExtraInfoWrapper
            open
            wrapperProps={{
                icon: <Icons.ENS size={24} />,
                borderRadius: '0px',
                margin: '0px',
            }}
            key={PluginID.ENS}
            title={<PluginI18NFieldRender field={base.name} pluginID={PluginID.ENS} />}
            publisher={
                base.publisher ? (
                    <PluginI18NFieldRender pluginID={PluginID.ENS} field={base.publisher.name} />
                ) : undefined
            }
            publisherLink={base.publisher?.link}>
            {children}
        </MaskPostExtraInfoWrapper>
    )
}
