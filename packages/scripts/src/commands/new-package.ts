import { resolve } from 'path'
import { camelCase, identity, kebabCase, upperFirst } from 'lodash-es'
import { task } from '../utils/task.js'
import { ROOT_PATH } from '../utils/paths.js'
import { awaitChildProcess, changeFile, shell } from '../utils/index.js'
import { fileURLToPath } from 'url'

type PackageOptions = {
    type: 'plugin' | 'package'
    path: string
    npmName: string
    pluginID?: string
}
export async function createPackageInteractive() {
    const { default: enquirer } = await import('enquirer')
    const { prompt } = enquirer
    // Select package type
    const packageDetail: PackageOptions = {
        path: '',
        npmName: '',
        type: await prompt<{ type: 'plugin' | 'package' }>({
            type: 'select',
            name: 'type',
            choices: ['plugin', 'package'],
            message: 'What type of package do you want to create?',
        }).then((x) => x.type),
    }

    if (packageDetail.type === 'plugin') {
        packageDetail.pluginID = await prompt<{ pluginID: string }>({
            type: 'input',
            message: 'What is the plugin ID? (e.g. "io.mask.example-plugin")',
            name: 'pluginID',
        }).then((x) => x.pluginID)
    }

    // Choose monorepo folder name
    {
        const base = 'packages/' + (packageDetail.type === 'plugin' ? 'plugins/' : '')
        packageDetail.path =
            base +
            (packageDetail.type === 'plugin' ? upperFirst : identity)(
                await prompt<{ name: string }>({
                    type: 'input',
                    name: 'name',
                    message: 'Create a new package at: ' + base,
                }).then((x) => x.name),
            )
    }

    // Choose npm package name
    {
        const suggestedNpmPackageName = kebabCase(packageDetail.path.split('/').at(-1))
        packageDetail.npmName =
            '@masknet/' +
            (await prompt<{ npmName: string }>({
                type: 'input',
                name: 'npmName',
                message: 'What is the npm package name? @masknet/',
                initial:
                    packageDetail.type === 'package' ? suggestedNpmPackageName : 'plugin-' + suggestedNpmPackageName,
            }).then((x) => x.npmName))
    }

    return createNewPackage(packageDetail)
}
task(createPackageInteractive, 'new-pkg', 'Create a new package interactively')

const INSERT_HERE = '// @masknet/scripts: insert-here'
async function createNewPackage({ path, npmName, type, pluginID }: PackageOptions) {
    const { copy, ensureDir } = await import('fs-extra')
    const packagePath = fileURLToPath(new URL(path, ROOT_PATH))
    await ensureDir(packagePath)

    // Copy package template
    if (type === 'plugin') {
        // cp -r packages/plugins/template packages/plugins/NEW_PLUGIN
        await copy(fileURLToPath(new URL('packages/plugins/template/', ROOT_PATH)), packagePath, {
            filter: (src) => {
                if (src.includes('node_modules') || src.includes('dist')) return false
                return true
            },
        })
    } else {
        // cp -r packages/empty packages/NEW_PACKAGE
        await copy(fileURLToPath(new URL('packages/empty/', ROOT_PATH)), packagePath, {
            filter: (src) => {
                if (src.includes('node_modules') || src.includes('dist')) return false
                return true
            },
        })
    }

    // Fix package name
    await changeFile.JSON(resolve(packagePath, 'package.json'), (content) => {
        content.name = npmName
    })

    if (type === 'plugin') {
        const NormativeName = upperFirst(camelCase(path.split('/').at(-1)))
        await changeFile.typescript(resolve(packagePath, 'src/constants.ts'), (content) =>
            content.replace('PluginID.Example', `PluginID.${NormativeName}`),
        )
        /**
         * .i18n-codegen.json
         * packages/plugins/tsconfig.json
         * packages/plugin-infra/src/types.ts
         * packages/mask/shared/plugin-infra/register.ts
         * packages/mask/package.json
         */
        await changeFile.JSON(new URL('.i18n-codegen.json', ROOT_PATH), (content) => {
            content.list.push({
                input: `./${path}/src/locales/en-US.json`,
                output: `./${path}/src/locales/i18n_generated`,
                parser: { type: 'i18next', contextSeparator: '$', pluralSeparator: '_' },
                generator: {
                    type: 'i18next/react-hooks',
                    hooks: 'useI18N',
                    namespace: pluginID,
                    trans: 'Translate',
                    emitTS: true,
                },
            })
        })
        await changeFile.JSON(new URL('packages/plugins/tsconfig.json', ROOT_PATH), (content) => {
            Array.from(content.references)
                .sort((a: any, b: any) => String(a.path).localeCompare(b.path, 'en'))
                .push({ path: `./${NormativeName}/` })
        })
        await changeFile.typescript(new URL('packages/plugin-infra/src/types.ts', ROOT_PATH), (content) =>
            content.replace(INSERT_HERE, `${NormativeName} = '${pluginID}'\n${INSERT_HERE}`),
        )
        await changeFile.typescript(
            new URL(`packages/mask/shared/plugin-infra/register.js`, ROOT_PATH),
            (content) => `${content}import '${npmName}/register'`,
        )
        await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --prefer-offline -C packages/mask ${npmName}`)
        await changeFile(new URL('packages/mask/package.json', ROOT_PATH), (content) =>
            content.replaceAll(/workspace:\^undefined/g, 'workspace:^'),
        )
        await changeFile(new URL('tsconfig.json', ROOT_PATH), (content) =>
            content.replace(INSERT_HERE + ' 3', `"${npmName}": ["./${path}/src"],\n      ${INSERT_HERE} 3`),
        )
    } else {
        await changeFile(new URL('tsconfig.json', ROOT_PATH), (content) =>
            content
                .replace(INSERT_HERE + ' 1', `${INSERT_HERE} 1\n    { "path": "./${path}/tsconfig.tests.json" },`)
                .replace(INSERT_HERE + ' 2', `"${npmName}": ["./${path}/src"],\n      ${INSERT_HERE} 2`),
        )
        await changeFile(resolve(packagePath, 'README.md'), () => `# ${npmName}\n`)
    }

    // regenerate lockfile and install dependencies for newly installed packages
    await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --prefer-offline`)
}
