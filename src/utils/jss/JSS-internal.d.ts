declare module 'warning' {
    export default function warning(...args: any[]): void
}

declare module 'jss' {
    import { BaseRule } from './CSSOM'
    import {
        SheetsRegistry as JSSSheetsRegistry,
        StyleSheet as JSSStyleSheet,
        RuleList as JSSRuleList,
        Renderer,
    } from 'jss/src/index'
    export * from 'jss/src/index.d'
    interface StyleSheetX<RuleName extends string = string> extends JSSStyleSheet {
        rules: RuleList
        attached: boolean
        renderer?: Renderer & { element: HTMLElement }
    }
    export interface StyleSheet<RuleName extends string = string> extends StyleSheetX {}
    export declare class SheetsRegistry extends JSSSheetsRegistry {
        registry: StyleSheetX<string>[]
    }
    export interface ToCssOptions {
        children: boolean
    }
}
