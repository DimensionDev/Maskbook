/// <reference types="@masknet/global-types/webpack" />

declare module '@onflow/fcl' {
    export interface User {
        addr: string | null
        f_type: 'User'
        f_vsn: string
        loggedIn: boolean | null
    }

    export interface Account {
        address: string
        balance: string
        code: string
    }

    export const config: (setup: Record<string, any>) => {}
    export const currentUser: () => {
        subscribe: (callback: (user: User) => void) => void
        snapshot: () => Promise<User | null>
        authenticate: () => {}
        unauthenticate: () => {}
    }
    export const subscribe: (callback: (user: User) => void) => void
    export const snapshot: () => User
    export const authenticate: () => {}
    export const unauthenticate: () => {}
    export const logIn: () => Promise<User | null>
    export const logOut: () => {}
    export const signUp: () => {}

    export const cdc: (template: TemplateStringsArray) => string
    export const args: (args: any[]) => any
    export const arg: (value: any, type: any) => any

    export const send: (data: string[]) => Promise<any>
    export const script: (text: string) => string
    export const decode: (response: any) => Promise<any>
    export const query: (options: { cadence: string; args: (arg: any, t: any) => any[] }) => Promise<any>
    export const getAccount: (address: string) => string
    export const getCollection: (collectionID: string) => any[]
}

declare module '@onflow/types' {
    export class Address {}
}
