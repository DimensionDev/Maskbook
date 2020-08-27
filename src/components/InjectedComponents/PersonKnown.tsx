import * as React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { useI18N } from '../../utils/i18n-next-ui'
import type { ProfileIdentifier } from '../../database/type'
import Services from '../../extension/service'
import type { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { useAsync } from 'react-use'
import { useMyIdentities } from '../DataSource/useActivatedUI'
export interface PersonKnownProps {
    pageOwner: ValueRef<ProfileIdentifier | null>
    bioContent: ValueRef<string>
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

export function PersonKnown(props: PersonKnownProps) {
    const { pageOwner, bioContent } = props
    const bio = useValueRef(bioContent)
    const owner = useValueRef(pageOwner)
    const myProfiles = useMyIdentities()

    const state = useAsync(async () => {
        if (!owner) return null
        const myProfile = myProfiles.find((x) => x.identifier.equals(owner))

        if (bio && myProfile) {
            const prove = await Services.Crypto.getMyProveBio(myProfile.identifier)
            if (prove && bio.includes(prove)) return null
            return { type: 'self', prove } as const
        }
        return null
    }, [owner?.toText(), bio, myProfiles.map((x) => x.identifier.toText()).join(',')])
    if (state.loading) return null
    if (!state.value) return null
    return <PersonKnownSelf {...props} bio={state.value.prove} />
}

export interface PersonKnownUIProps {
    AdditionalContentProps?: Partial<AdditionalContentProps>
    bio?: string | null
}
export function PersonKnownSelf(props: PersonKnownUIProps) {
    const { t } = useI18N()
    return (
        <AdditionalContent
            title={t('please_include_proof_your_bio', { bio: props.bio })}
            {...props.AdditionalContentProps}
        />
    )
}
