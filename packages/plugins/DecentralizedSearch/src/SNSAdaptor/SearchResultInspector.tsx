import { useRef, useEffect, useState } from 'react'
import { Hidden } from '@masknet/shared'
import { useActivatedPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { DecentralizedSearchPostExtraInfoWrapper } from './DecentralizedSearchPostExtraInfoWrapper.js'
import { PluginID } from '@masknet/shared-base'
import { LoadingContent } from './LoadingContent.js'
import { EmptyContent } from './EmptyContent.js'
import { LoadFailedContent } from './LoadFailedContent.js'

export function SearchResultInspector(props: { keyword: string }) {
    const ENS_Plugin = useActivatedPluginSNSAdaptor(PluginID.ENS, 'any')
    const ensRef = useRef<{
        isLoading: boolean
        isError: boolean
        reversedAddress: string
        tokenId: string
        retry: () => void
    }>()
    const ENSComponent = ENS_Plugin!.SearchResultContent?.UI?.Content!
    const [isLoading, setLoading] = useState(true)
    const [isHiddenAll, setHiddenAll] = useState(false)
    const [isEmpty, setEmpty] = useState(false)
    const [isError, setError] = useState(false)

    useEffect(() => {
        setLoading(!ensRef.current || ensRef.current?.isLoading)
        setHiddenAll(Boolean(ensRef.current && ensRef.current?.reversedAddress === undefined))
        setEmpty(
            Boolean(
                ensRef.current &&
                    (!ensRef.current?.reversedAddress || !ensRef.current?.tokenId) &&
                    !ensRef.current?.isLoading,
            ),
        )
        setError(Boolean(ensRef.current?.isError))
    }, [ensRef.current])

    return (
        <Hidden hidden={isHiddenAll}>
            <DecentralizedSearchPostExtraInfoWrapper>
                <Hidden hidden={isLoading || isEmpty || isError}>
                    <ENSComponent keyword={props.keyword} ref={ensRef} />
                </Hidden>
                <Hidden hidden={!isLoading}>
                    <LoadingContent />
                </Hidden>
                <Hidden hidden={!isEmpty}>
                    <EmptyContent />
                </Hidden>
                <Hidden hidden={!isError}>
                    <LoadFailedContent isLoading={isLoading} retry={ensRef.current?.retry} />
                </Hidden>
            </DecentralizedSearchPostExtraInfoWrapper>
        </Hidden>
    )
}
