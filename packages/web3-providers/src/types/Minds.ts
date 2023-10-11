export namespace MindBaseAPI {
    export interface User {
        username: string
        name: string
        avatar_url: {
            large: string
            master: string
            medium: string
            small: string
            tiny: string
        }
    }
}
