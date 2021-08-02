// https://www.npmjs.com/package/gulp-zip
declare module 'gulp-zip' {
    export interface Options {
        /** @default true */
        compress?: boolean
        /** @default undefined */
        modifiedTime?: Date
        /** @default true */
        buffer?: boolean
    }
    declare const f: (filename: string, options?: Options) => NodeJS.ReadWriteStream
    export = f
}
