import { ProfileIdentifier } from '../../database/type'
import * as React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { geti18nString } from '../../utils/i18n'
import AsyncComponent from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'

export interface PersonKnownProps {
    whois?: ProfileIdentifier | null
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

export function PersonKnown(props: PersonKnownProps) {
    const { whois } = props
    if (!whois) return null
    return (
        <AsyncComponent
            promise={() =>
                Services.Identity.queryProfile(whois).then(p => {
                    if (!p.linkedPersona?.fingerprint) throw new TypeError('public key not found')
                })
            }
            dependencies={[]}
            awaitingComponent={null}
            completeComponent={
                <AdditionalContent
                    center
                    title={geti18nString('seen_in_maskbook_database')}
                    {...props.AdditionalContentProps}
                />
            }
            failedComponent={null}
        />
    )
}
