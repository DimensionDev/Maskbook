import { fetchApplications, fetchProjectById } from '../../apis/index.js'
import { useAsyncRetry } from 'react-use'

export function useProject(id: string) {
    return useAsyncRetry(async () => {
        const project = await fetchProjectById(id)
        const applications = await fetchApplications(id)
        return {
            project,
            applications,
        }
    }, [id])
}
