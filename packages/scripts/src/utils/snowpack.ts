import { shell } from '.'

export function createBuildSnowpack(cwd: string, output: string, name: string) {
    const fn = () => {
        return shell.cwd(cwd)`npx snowpack build --buildOptions.out ${output}`
    }
    fn.displayName = `${name}-snowpack`
    fn.description = `Build snowpack of ${name} to ${output}`
    return fn
}
