interface Permissions {
    request(permissionDesc: PermissionDescriptor): Promise<PermissionStatus>
}

interface ImportMeta {
    url: string
}

// #region Trusted Types
interface TrustedHTML {
    toString(): string
}
interface TrustedScript {}
interface TrustedScriptURL {}
interface TrustedTypePolicy {
    createHTML?(input: string, ...args: any): TrustedHTML
    createScript?(input: string, ...args: any): TrustedScript
    createScriptURL?(input: string, ...args: any): TrustedScript
}
interface TrustedTypePolicyFactory {
    readonly emptyHTML: TrustedHTML
    readonly emptyScript: TrustedScript
    readonly defaultPolicy: TrustedTypePolicy
    createPolicy(policyName: string, policyOptions: TrustedTypePolicy): TrustedTypePolicy
    isHTML(value: unknown): value is TrustedHTML
    isScript(value: unknown): value is TrustedScript
    isScriptURL(value: unknown): value is TrustedScriptURL
    getAttributeType(
        tagName: string,
        attribute?: string,
        elementNS?: string,
        attrNS?: string,
    ): 'TrustedHTML' | 'TrustedScript' | 'TrustedScriptURL' | null
    getPropertyType(
        tagName: string,
        property: string,
        elementNS: string,
    ): 'TrustedHTML' | 'TrustedScript' | 'TrustedScriptURL' | null
}
declare var trustedTypes: TrustedTypePolicyFactory | undefined
interface DOMParser {
    parseFromString(string: string | TrustedHTML, type: DOMParserSupportedType): Document
}
declare namespace React {
    interface HTMLAttributes<T> {
        dangerouslySetInnerHTML?: { __html: string | TrustedHTML } | undefined
    }
}

// #endregion
