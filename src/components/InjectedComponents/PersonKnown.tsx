import * as React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { geti18nString } from '../../utils/i18n'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { ProfileIdentifier } from '../../database/type'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'

export interface PersonKnownProps {
    pageOwner: ValueRef<ProfileIdentifier | null>
    bioContent: ValueRef<string>
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

export function PersonKnown(props: PersonKnownProps) {
    const { pageOwner, bioContent } = props
    const bio = useValueRef(bioContent)
    const owner = useValueRef(pageOwner)

    if (!owner) return null
    return (
        <AsyncComponent
            promise={async () => {
                const profiles = await Services.Identity.queryMyProfiles(owner.network)
                const myProfile = profiles.find(x => x.identifier.equals(owner))

                if (bio && myProfile) {
                    const prove = await Services.Crypto.getMyProveBio(myProfile.identifier)
                    if (prove && bio.includes(prove)) return null
                    return { type: 'self', prove }
                } else {
                    const otherProfile = await Services.Identity.queryProfile(owner)
                    if (!otherProfile.linkedPersona?.fingerprint) return null
                    return { type: 'others' }
                }
            }}
            dependencies={[owner.toText(), bio]}
            awaitingComponent={null}
            completeComponent={({ data }) => {
                if (data === null) return null
                switch (data.type) {
                    case 'self':
                        return (
                            <AdditionalContent
                                hideIcon
                                center
                                title={geti18nString('please_include_proof_your_bio', data.prove!)}
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
                    default:
                        return null
                }
            }}
            failedComponent={null}
        />
    )
}
