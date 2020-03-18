import * as React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { useI18N } from '../../utils/i18n-next-ui'
import { ProfileIdentifier } from '../../database/type'
import Services from '../../extension/service'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { Typography } from '@material-ui/core'
import { useAsync } from 'react-use'

export interface PersonKnownProps {
    pageOwner: ValueRef<ProfileIdentifier | null>
    bioContent: ValueRef<string>
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

export function PersonKnown(props: PersonKnownProps) {
    const { t } = useI18N()
    const { pageOwner, bioContent } = props
    const bio = useValueRef(bioContent)
    const owner = useValueRef(pageOwner)

    const header = (text: string) => (
        <Typography
            variant="caption"
            color="textSecondary"
            gutterBottom
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {text}
        </Typography>
    )
    const state = useAsync(async () => {
        if (!owner) return null
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
    }, [owner?.toText(), bio])
    if (state.loading) return null
    if (!state.value) return null
    switch (state.value.type) {
        case 'self':
            return (
                <AdditionalContent
                    header={header(t('please_include_proof_your_bio', { bio: state.value.prove }))}
                    {...props.AdditionalContentProps}
                />
            )
        case 'others':
            return (
                <AdditionalContent header={header(t('seen_in_maskbook_database'))} {...props.AdditionalContentProps} />
            )
        default:
            return null
    }
}
