import { shell } from './run'
export function createBuildStorybook6(cwd: string, output: string, name: string) {
    const fn = () => {
        return shell.cwd(cwd)`npx build-storybook -o ${output} --quiet`
    }
    fn.displayName = `${name}-storybook`
    fn.description = `Build storybook of ${name} to ${output}`
    return fn
}
