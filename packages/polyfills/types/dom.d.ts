interface ImportMeta {
    url: string
}

// #region Trusted Types
interface Element {
    insertAdjacentHTML(position: InsertPosition, text: string | TrustedHTML): void
}
interface TrustedHTML {
    toString(): string
}
interface TrustedScript {}
interface TrustedScriptURL {}
interface TrustedTypePolicyOptions {
    createHTML?(input: string, ...args: any): string
    createScript?(input: string, ...args: any): string
    createScriptURL?(input: string, ...args: any): string
}
interface TrustedTypePolicy {
    createHTML(input: string, ...args: any): TrustedHTML
    createScript(input: string, ...args: any): TrustedScript
    createScriptURL(input: string, ...args: any): TrustedScript
}
interface TrustedTypePolicyFactory {
    readonly emptyHTML: TrustedHTML
    readonly emptyScript: TrustedScript
    readonly defaultPolicy: TrustedTypePolicy
    createPolicy(policyName: string, policyOptions: TrustedTypePolicyOptions): TrustedTypePolicy
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
declare module 'react/index.d' {
    declare namespace React {
        interface HTMLAttributes<T> {
            dangerouslySetInnerHTML?: { __html: string | TrustedHTML } | undefined
            'data-hide-scrollbar'?: boolean | undefined
        }
    }
}
// #endregion
