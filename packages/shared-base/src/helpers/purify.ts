import DOMPurify from 'dompurify'

// NEVER expose this policy to the external!
const policy =
    typeof trustedTypes !== 'undefined' ?
        trustedTypes.createPolicy('mask', {
            createHTML: (x) => x,
        })
    :   null

export function purify(html: string): TrustedHTML | string {
    const sanitized = DOMPurify.sanitize(html)
    return policy?.createHTML?.(sanitized) ?? sanitized
}
