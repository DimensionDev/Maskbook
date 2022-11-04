import { useRef } from 'react'
import { useActivatedPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { DecentralizedSearchPostExtraInfoWrapper } from './DecentralizedSearchPostExtraInfoWrapper.js'
import { PluginID } from '@masknet/shared-base'

export function SearchResultInspector(props: { keyword: string }) {
    const ENS_Plugin = useActivatedPluginSNSAdaptor(PluginID.ENS, 'any')
    const ensRef = useRef()
    const ENSComponent = ENS_Plugin!.SearchResultContent?.UI?.Content!
    console.log({ props })
    return (
        <DecentralizedSearchPostExtraInfoWrapper>
            <ENSComponent keyword={props.keyword} ref={ensRef} />
        </DecentralizedSearchPostExtraInfoWrapper>
    )
}
