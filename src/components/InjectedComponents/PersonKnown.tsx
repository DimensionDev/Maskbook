import { PersonIdentifier } from '../../database/type'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { geti18nString } from '../../utils/i18n'
import AsyncComponent from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'

export interface PersonKnownProps {
    whois?: PersonIdentifier | null
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

export function PersonKnown(props: PersonKnownProps) {
    const { whois } = props
    if (!whois) return null
    return (
        <AsyncComponent
            promise={() =>
                Services.People.queryPerson(whois).then(p => {
                    if (!p.fingerprint) throw new TypeError('public key not found')
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
