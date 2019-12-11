import { ProfileIdentifier } from '../../database/type'
import * as React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { geti18nString } from '../../utils/i18n'
import AsyncComponent from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'

export interface PersonKnownProps {
    bioContent: ValueRef<string>
    pageOwner?: ProfileIdentifier | null
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

type Type = { type: 'self'; provePost: string } | { type: 'others' } | null
export function PersonKnown(props: PersonKnownProps) {
    const { pageOwner, bioContent } = props
    const bio = useValueRef(bioContent)
    if (!pageOwner) return null
    return (
        <AsyncComponent
            promise={async (): Promise<Type> => {
                const profiles = await Services.Identity.queryMyProfiles(pageOwner.network)
                const myProfile = profiles.find(x => x.identifier.equals(pageOwner))
                if (myProfile) {
                    const prove = await Services.Crypto.getMyProveBio(myProfile.identifier)
                    if (!prove) return null
                    if (bio.includes(prove)) return null
                    return { type: 'self', provePost: prove }
                } else {
                    const profile = await Services.Identity.queryProfile(pageOwner)
                    if (!profile.linkedPersona?.fingerprint) return null
                    return { type: 'others' }
                }
            }}
            dependencies={[pageOwner.toText(), bio]}
            awaitingComponent={null}
            completeComponent={({ data }) => {
                if (data === null) return null
                switch (data.type) {
                    case 'self':
                        return (
                            <AdditionalContent
                                hideIcon
                                center
                                title={geti18nString('please_include_proof_your_bio', data.provePost)}
                                {...props.AdditionalContentProps}
                            />
                        )
                    case 'others':
                        return (
                            <AdditionalContent
                                center
                                title={geti18nString('seen_in_maskbook_database')}
                                {...props.AdditionalContentProps}
                            />
                        )
                }
            }}
            failedComponent={null}
        />
    )
}
