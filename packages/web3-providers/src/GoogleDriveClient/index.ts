interface FileMetadata {
    name?: string
    description?: string
    parents?: string[]
    mimeType?: string
    [key: string]: any
}

export interface DriveFile {
    id: string
    name: string
    mimeType: string
    createdTime: string
    modifiedTime: string
    size?: string
}

interface ListFilesParams {
    q?: string
    pageSize?: string
    pageToken?: string
    spaces?: string
    fields?: string
}

interface UserInfo {
    sub: string
    name?: string
    given_name?: string
    family_name?: string
    picture?: string // avatar url
    email?: string
    email_verified?: boolean
    locale?: string
}

type Callback = (isLogin: boolean) => void
export class GoogleDriveClient {
    private getToken: (interactive?: boolean) => Promise<string | undefined>
    private clearToken: () => Promise<void>
    private baseUrl: string = 'https://www.googleapis.com/drive/v3'
    private uploadUrl: string = 'https://www.googleapis.com/upload/drive/v3'
    private backupFolderName: string = 'Mask network backup'
    private callbacks: Callback[] = []

    constructor(getToken: () => Promise<string | undefined>, clearToken: () => Promise<void>) {
        this.getToken = getToken
        this.clearToken = clearToken
    }

    async login(interactive?: boolean) {
        const userInfo = await this.getUserInfo(interactive)
        if (userInfo) {
            this.callbacks.forEach((callback) => callback(true))
        }
        return userInfo
    }
    async logout() {
        try {
            const token = await this.getToken()
            const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
            if (!response.ok) {
                const failedRes = await response.json()
                console.error('Failed to revoke access token:', response.status, failedRes)
            }
            await this.clearToken()
            this.callbacks.forEach((callback) => callback(false))
        } catch {
            return
        }
    }
    private async request(
        input: string | URL | globalThis.Request,
        init?: RequestInit,
        interactive?: boolean,
    ): Promise<Response> {
        const token = await this.getToken(interactive)
        const headers = new Headers(init?.headers)
        headers.set('Authorization', `Bearer ${token}`)
        const response = await fetch(input, { ...init, headers })
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                await this.logout()
            }
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response
    }
    public subscribe(callback: Callback) {
        this.callbacks.push(callback)
        return () => {
            this.callbacks = this.callbacks.filter((cb) => cb !== callback)
        }
    }

    public async listFiles(params: ListFilesParams = {}): Promise<DriveFile[]> {
        try {
            const queryParams = new URLSearchParams({
                fields: 'files(id,name,mimeType,createdTime,modifiedTime,size)',
                ...params,
            } as Record<string, string>)

            const response = await this.request(`${this.baseUrl}/files?${queryParams}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = (await response.json()) as { files: DriveFile[] }
            return data.files
        } catch (error) {
            console.error('Error listing files:', error)
            throw error
        }
    }

    // Get or create backup folder
    private async getOrCreateBackupFolder(): Promise<string> {
        try {
            // Check if the folder exists
            const response = await this.request(
                `${this.baseUrl}/files?${new URLSearchParams({
                    q: `name='${this.backupFolderName}' and mimeType='application/vnd.google-apps.folder'`,
                    fields: 'files(id,name)',
                    spaces: 'drive',
                })}`,

                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = (await response.json()) as { files: DriveFile[] }
            const existingFolder = data.files.find((f) => f.name === this.backupFolderName)

            if (existingFolder) {
                return existingFolder.id
            }

            const folderMetadata: FileMetadata = {
                name: this.backupFolderName,
                mimeType: 'application/vnd.google-apps.folder',
            }

            const createResponse = await this.request(`${this.baseUrl}/files`, {
                method: 'POST',
                body: JSON.stringify(folderMetadata),
            })

            if (!createResponse.ok) {
                throw new Error(`HTTP error! status: ${createResponse.status}`)
            }

            const newFolder = (await createResponse.json()) as DriveFile
            return newFolder.id
        } catch (error) {
            console.error('Error getting or creating backup folder:', error)
            throw error
        }
    }

    // List files in the backup folder
    public async listBackupFiles(params: ListFilesParams = {}): Promise<DriveFile[]> {
        try {
            const folderId = await this.getOrCreateBackupFolder()

            const queryParams = new URLSearchParams({
                q: `'${folderId}' in parents`,
                fields: 'files(id,name,mimeType,createdTime,modifiedTime,size)',
                spaces: 'drive',
                ...params,
            })

            const response = await this.request(`${this.baseUrl}/files?${queryParams}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = (await response.json()) as { files: DriveFile[] }
            return data.files
        } catch (error) {
            console.error('Error listing backup files:', error)
            throw error
        }
    }

    public async uploadFile(file: File, metadata: FileMetadata = {}): Promise<DriveFile> {
        try {
            const folderId = await this.getOrCreateBackupFolder()
            const formData = new FormData()
            const fileMetadata: FileMetadata = {
                name: file.name,
                parents: [folderId],
                ...metadata,
            }

            formData.append(
                'metadata',
                new Blob([JSON.stringify(fileMetadata)], {
                    type: 'application/json',
                }),
            )
            formData.append('file', file)

            const response = await this.request(`${this.uploadUrl}/files?uploadType=multipart`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return (await response.json()) as DriveFile
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        }
    }

    public async deleteFile(fileId: string): Promise<boolean> {
        try {
            await this.request(`${this.baseUrl}/files/${fileId}`, {
                method: 'DELETE',
            })

            return true
        } catch (error) {
            console.error('Error deleting file:', error)
            throw error
        }
    }

    public getDownloadUrl(fileId: string): string {
        return `${this.baseUrl}/files/${fileId}?alt=media`
    }
    public async downloadFile(fileId: string): Promise<Blob> {
        try {
            const response = await this.request(this.getDownloadUrl(fileId))
            return await response.blob()
        } catch (error) {
            console.error('Error downloading file:', error)
            throw error
        }
    }
    /** Avoid leaking token */
    public async requestFile(fileId: string): Promise<Response> {
        const token = await this.getToken()
        const response = await this.request(this.getDownloadUrl(fileId), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response
    }

    public async getUserInfo(interactive?: boolean): Promise<UserInfo> {
        try {
            const response = await this.request(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                interactive,
            )

            return (await response.json()) as UserInfo
        } catch (error) {
            console.error('Error getting user info:', error)
            throw error
        }
    }
}
