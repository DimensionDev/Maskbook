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

export class GoogleDriveClient {
    private accessToken: string
    private baseUrl: string = 'https://www.googleapis.com/drive/v3'
    private uploadUrl: string = 'https://www.googleapis.com/upload/drive/v3'
    private backupFolderName: string = 'Mask network backup'

    constructor(accessToken: string) {
        this.accessToken = accessToken
    }

    public async listFiles(params: ListFilesParams = {}): Promise<DriveFile[]> {
        try {
            const queryParams = new URLSearchParams({
                fields: 'files(id,name,mimeType,createdTime,modifiedTime,size)',
                ...params,
            } as Record<string, string>)

            const response = await fetch(`${this.baseUrl}/files?${queryParams}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

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
            const response = await fetch(
                `${this.baseUrl}/files?${new URLSearchParams({
                    q: `name='${this.backupFolderName}' and mimeType='application/vnd.google-apps.folder'`,
                    fields: 'files(id,name)',
                    spaces: 'drive',
                })}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
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

            const createResponse = await fetch(`${this.baseUrl}/files`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
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

            const response = await fetch(`${this.baseUrl}/files?${queryParams}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
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

            const response = await fetch(`${this.uploadUrl}/files?uploadType=multipart`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
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
            const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return true
        } catch (error) {
            console.error('Error deleting file:', error)
            throw error
        }
    }

    public async downloadFile(fileId: string): Promise<Blob> {
        try {
            const response = await fetch(`${this.baseUrl}/files/${fileId}?alt=media`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.blob()
        } catch (error) {
            console.error('Error downloading file:', error)
            throw error
        }
    }

    public async getUserInfo(): Promise<UserInfo> {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return (await response.json()) as UserInfo
        } catch (error) {
            console.error('Error getting user info:', error)
            throw error
        }
    }
}
