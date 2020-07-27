import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { identifier } from './constants'

export const FileServiceDatabase = createPluginDatabase(identifier)
