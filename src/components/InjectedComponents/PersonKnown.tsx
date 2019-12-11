import { ProfileIdentifier } from '../../database/type'
import * as React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { geti18nString } from '../../utils/i18n'
import AsyncComponent from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'

export interface PersonKnownProps {
    bioContent?: string
    pageOwner?: ProfileIdentifier | null
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

type Type = { type: 'self'; provePost: string } | { type: 'others' } | null
export function PersonKnown(props: PersonKnownProps) {
    const { pageOwner, bioContent } = props
    if (!pageOwner) return null
    return (
        <AsyncComponent
            promise={async (): Promise<Type> => {
                const profiles = await Services.Identity.queryMyProfiles('facebook.com')
                const myProfile = profiles.find(x => x.identifier.equals(pageOwner))
                if (myProfile) {
                    const prove = await Services.Crypto.getMyProveBio(myProfile.identifier)
                    if (!prove) return null
                    if (bioContent === undefined) return null
                    if (bioContent.includes(prove)) return null
                    return { type: 'self', provePost: prove }
                } else {
                    const profile = await Services.Identity.queryProfile(pageOwner)
                    if (!profile.linkedPersona?.fingerprint) return null
                    return { type: 'others' }
                }
            }}
            dependencies={[]}
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
