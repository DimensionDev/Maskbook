import { Attachment } from '@dimensiondev/common-protocols'
import { encodeArrayBuffer } from '@dimensiondev/kit'
import { Checkbox, FormControlLabel, makeStyles, Typography, Link } from '@material-ui/core'
import { isNil } from 'lodash-es'
import { Trans } from 'react-i18next'
import { useHistory } from 'react-router'
import { useAsync } from 'react-use'
import { PluginFileServiceRPC } from '../utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeFileKey } from '../arweave/makeFileKey'
import { FileRouter, MAX_FILE_SIZE } from '../constants'
import { RecentFiles } from './RecentFiles'
import { UploadDropArea } from './UploadDropArea'
import { useState } from 'react'
import { SkynetClient, parseSkylink } from "skynet-js";

const isValidSkylink = (skylink) => {
    try {
        parseSkylink(skylink); // try to parse the skylink, it will throw on error
    } catch (error) {
        return false;
    }

    return true;
};

const getFilePath = (file) => file.webkitRelativePath || file.path || file.name;

const getRelativeFilePath = (file) => {
    const filePath = getFilePath(file);
    const { root, dir, base } = path.parse(filePath);
    const relative = path.normalize(dir).slice(root.length).split(path.sep).slice(1);

    return path.join(...relative, base);
};

const getRootDirectory = (file: FileInfo ) => {
    const filePath = getFilePath(file);
    const { root, dir } = path.parse(filePath);

    return path.normalize(dir).slice(root.length).split(path.sep)[0];
};

const createUploadErrorMessage = (error) => {
    // The request was made and the server responded with a status code that falls out of the range of 2xx
    if (error.response) {
        if (error.response.data.message) {
            return `Upload failed with error: ${error.response.data.message}`;
        }

        const statusCode = error.response.status;
        const statusText = getReasonPhrase(error.response.status);

        return `Upload failed, our server received your request but failed with status code: ${statusCode} ${statusText}`;
    }

    // The request was made but no response was received. The best we can do is detect whether browser is online.
    // This will be triggered mostly if the server is offline or misconfigured and doesn't respond to valid request.
    if (error.request) {
        if (!navigator.onLine) {
            return "You are offline, please connect to the internet and try again";
        }

        // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
        return "Server failed to respond to your request, please try again later.";
    }

    // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
    return `Critical error, please refresh the application and try again. ${error.message}`;
};



export const SkynetUpload: React.FC = () => {
    const [files, setFiles] = useState([]);
    const [skylink, setSkylink] = useState("");
    const { apiUrl } = useContext(AppContext);
    const [directoryMode, setDirectoryMode] = useState(false);
    const client = new SkynetClient(apiUrl);

    useEffect(() => {
        if (directoryMode) {
            inputRef.current.setAttribute("webkitdirectory", "true");
        } else {
            inputRef.current.removeAttribute("webkitdirectory");
        }
    }, [directoryMode]);

    const handleDrop = async (acceptedFiles) => {
        if (directoryMode && acceptedFiles.length) {
            const rootDir = getRootDirectory(acceptedFiles[0]); // get the file path from the first file

            acceptedFiles = [{ name: rootDir, directory: true, files: acceptedFiles }];
        }

        setFiles((previousFiles) => [...acceptedFiles.map((file) => ({ file, status: "uploading" })), ...previousFiles]);

        const onFileStateChange = (file, state) => {
            setFiles((previousFiles) => {
                const index = previousFiles.findIndex((f) => f.file === file);

                return [
                    ...previousFiles.slice(0, index),
                    {
                        ...previousFiles[index],
                        ...state,
                    },
                    ...previousFiles.slice(index + 1),
                ];
            });
        };

        acceptedFiles.forEach((file) => {
            const onUploadProgress = (progress) => {
                const status = progress === 1 ? "processing" : "uploading";

                onFileStateChange(file, { status, progress });
            };

            // Reject files larger than our hard limit of 1 GB with proper message
            if (file.size > bytes("1 GB")) {
                onFileStateChange(file, { status: "error", error: "This file size exceeds the maximum allowed size of 1 GB." });

                return;
            }

            const upload = async () => {
                try {
                    let response;

                    if (file.directory) {
                        const directory = file.files.reduce((acc, file) => ({ ...acc, [getRelativeFilePath(file)]: file }), {});

                        response = await client.uploadDirectory(directory, encodeURIComponent(file.name), { onUploadProgress });
                    } else {
                        response = await client.uploadFile(file, { onUploadProgress });
                    }

                    onFileStateChange(file, { status: "complete", url: client.getSkylinkUrl(response) });
                } catch (error) {
                    if (error.response && error.response.status === StatusCodes.TOO_MANY_REQUESTS) {
                        onFileStateChange(file, { progress: -1 });

                        return new Promise((resolve) => setTimeout(() => resolve(upload()), 3000));
                    }

                    onFileStateChange(file, { status: "error", error: createUploadErrorMessage(error) });
                }
            };

            upload();
        });
    };

    const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({ onDrop: handleDrop });

    const handleSkylink = (event) => {
        event.preventDefault();

        // only try to open a valid skylink
        if (isValidSkylink(skylink)) {
            client.openFile(skylink);
        }
    };

    return (
       // add component upload
    )
}
