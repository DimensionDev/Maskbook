import * as React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { useI18N } from '../../utils/i18n-next-ui'
import type { ProfileIdentifier } from '../../database/type'
import Services from '../../extension/service'
import type { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { Typography } from '@material-ui/core'
import { useAsync } from 'react-use'
import CheckIcon from '@material-ui/icons/Check'
export interface PersonKnownProps {
    pageOwner: ValueRef<ProfileIdentifier | null>
    bioContent: ValueRef<string>
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

export function PersonKnown(props: PersonKnownProps) {
    const { pageOwner, bioContent } = props
    const bio = useValueRef(bioContent)
    const owner = useValueRef(pageOwner)

    const state = useAsync(async () => {
        if (!owner) return null
        const profiles = await Services.Identity.queryMyProfiles(owner.network)
        const myProfile = profiles.find((x) => x.identifier.equals(owner))

        if (bio && myProfile) {
            const prove = await Services.Crypto.getMyProveBio(myProfile.identifier)
            if (prove && bio.includes(prove)) return null
            return { type: 'self', prove }
        } else {
            const otherProfile = await Services.Identity.queryProfile(owner)
            if (!otherProfile.linkedPersona?.fingerprint) return null
            return { type: 'others' }
        }
    }, [owner?.toText(), bio])
    if (state.loading) return null
    if (!state.value) return null
    switch (state.value.type) {
        case 'self':
            return <PersonKnownSelf {...props} bio={state.value.prove} />
        case 'others':
            return <PersonKnownOthers {...props} bio={state.value.prove} />
        default:
            return null
    }
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

export function PersonKnownOthers(props: PersonKnownUIProps) {
    const { t } = useI18N()
    return (
        <AdditionalContent title={t('seen_in_maskbook_database')} titleIcon="check" {...props.AdditionalContentProps} />
    )
}
