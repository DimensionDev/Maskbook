import { resolve } from 'path'
import { copy, ensureDir } from 'fs-extra'
import { prompt } from 'enquirer'
import { kebabCase, upperFirst } from 'lodash-unified'
import { task } from '../utils/task'
import { ROOT_PATH } from '../utils/paths'
import { awaitChildProcess, changeFile, shell } from '../utils'

type PackageOptions = {
    type: 'plugin' | 'package'
    path: string
    i18n: boolean
    npmName: string
    pluginID?: string
}
export async function createPackageInteractive() {
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
        i18n: true,
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
            upperFirst(
                await prompt<{ name: string }>({
                    type: 'input',
                    name: 'name',
                    message: 'Create a new package at: ' + base,
                }).then((x) => x.name),
            )
        packageDetail.path
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

    if (packageDetail.type === 'plugin') packageDetail.i18n = true
    else {
        packageDetail.i18n = await prompt<{ i18n: boolean }>({
            type: 'confirm',
            name: 'i18n',
            message: 'Add i18n support for this package?',
            initial: true,
        }).then((x) => x.i18n)
    }

    return createNewPackage(packageDetail)
}
task(createPackageInteractive, 'create-package', 'Create a new package interactively')

async function createNewPackage({ i18n, path, npmName, type, pluginID }: PackageOptions) {
    await changeFile(resolve(ROOT_PATH, 'pnpm-workspace.yaml'), (content) => content + `  - '${path}'\n`)

    const packagePath = resolve(ROOT_PATH, path)
    await ensureDir(packagePath)

    if (type === 'plugin') {
        const NormativeName = path.split('/').at(-1)
        // cp -r packages/plugins/template packages/plugins/NEW_PLUGIN
        await copy(resolve(ROOT_PATH, 'packages/plugins/template'), packagePath, {
            filter: (src) => {
                if (src.includes('node_modules') || src.includes('dist')) return false
                return true
            },
        })
        await changeFile.typescript(resolve(packagePath, 'src/constants.ts'), (content) =>
            content.replace('PluginId.Example', `PluginId.${NormativeName}`),
        )
        await changeFile.JSON(resolve(packagePath, 'package.json'), (content) => {
            content.name = npmName
        })

        /**
         * .i18n-codegen.json
         * packages/plugins/tsconfig.json
         * packages/plugin-infra/src/types.ts
         * packages/mask/src/plugin-infra/register.ts
         * packages/mask/package.json
         */
        const INSERT_HERE = '// @masknet/scripts: insert-here'
        await changeFile.JSON(resolve(ROOT_PATH, '.i18n-codegen.json'), (content) => {
            content.list.push({
                input: `./${path}/src/locales/en-US.json`,
                output: `./${path}/src/locales/i18n_generated`,
                parser: 'i18next',
                generator: {
                    type: 'i18next/react-hooks',
                    hooks: 'useI18N',
                    namespace: pluginID,
                    trans: 'Translate',
                    sourceMap: 'inline',
                },
            })
        })
        await changeFile.JSON(resolve(ROOT_PATH, 'packages/plugins/tsconfig.json'), (content) => {
            content.references.push({ path: `./${NormativeName}/` })
        })
        await changeFile.typescript(resolve(ROOT_PATH, 'packages/plugin-infra/src/types.ts'), (content) =>
            content.replace(INSERT_HERE, `${NormativeName} = '${pluginID}'\n${INSERT_HERE}`),
        )
        await changeFile.typescript(
            resolve(ROOT_PATH, `packages/mask/src/plugin-infra/register.ts`),
            (content) => `${content}import '${npmName}'`,
        )
        await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --prefer-offline -C packages/mask ${npmName}`)
        await changeFile(resolve(ROOT_PATH, 'packages/mask/package.json'), (content) =>
            content.replaceAll(/workspace:\^undefined/g, 'workspace:*'),
        )
        // regenerate lockfile
        await awaitChildProcess(shell.cwd(ROOT_PATH)`pnpm install --prefer-offline -C packages/mask ${npmName}`)
    } else {
    }
}
