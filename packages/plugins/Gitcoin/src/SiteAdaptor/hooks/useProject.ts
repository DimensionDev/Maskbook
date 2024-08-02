import { PluginID } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import { fetchApplications, fetchProjectById } from '../../apis/index.js'

export function useProject(id: string) {
    return useQuery({
        queryKey: [PluginID.Gitcoin, 'project', 'id'],
        queryFn: async () => {
            const project = await fetchProjectById(id)
            const applications = await fetchApplications(id)
            return {
                project,
                applications,
            }
        },
    })
}
