import { type ECKeyIdentifier, ProfileIdentifier } from '@masknet/shared-base'
export function isProfileIdentifier(value: ECKeyIdentifier | ProfileIdentifier): value is ProfileIdentifier {
    return value instanceof ProfileIdentifier
}
