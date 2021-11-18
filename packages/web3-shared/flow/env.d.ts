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
    }
    export const logIn: () => {}
    export const logOut: () => {}
    export const signUp: () => {}
    export const unauthenticate: () => {}

    export const send: (data: string[]) => Promise<any>
    export const script: (text: string) => string
    export const getAccount: (address: string) => string
}
