import { shell } from './run.js'
import { fileURLToPath } from 'url'
export function createBuildStorybook6(cwd: URL, output: URL, name: string) {
    const fn = () => {
        return shell.cwd(cwd)`npx build-storybook -o ${fileURLToPath(output)} --quiet`
    }
    fn.displayName = `${name}-storybook`
    fn.description = `Build storybook of ${name} to ${output}`
    return fn
}
