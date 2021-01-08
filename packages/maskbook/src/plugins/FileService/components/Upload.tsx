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

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: 250,
    },
    upload: {
        flex: 1,
        display: 'flex',
    },
    legal: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 'fit-content',
    },
    encrypted: {
        userSelect: 'none',
        '& span': {
            fontSize: 12,
            lineHeight: 1.75,
        },
    },
    legalText: {
        userSelect: 'none',
        fontSize: 12,
        lineHeight: 1.75,
        color: theme.palette.text.hint,
        '& a': {
            textDecoration: 'none',
        },
    },
}))

export const Upload: React.FC = () => {
    const { t } = useI18N()
    const classes = useStyles()
    const history = useHistory()
    const [encrypted, setEncrypted] = useState(true)
    const recent = useAsync(() => PluginFileServiceRPC.getRecentFiles(), [])
    const onFile = async (file: File) => {
        let key: string | undefined = undefined
        if (encrypted) {
            key = makeFileKey()
        }
        const block = new Uint8Array(await file.arrayBuffer())
        const checksum = encodeArrayBuffer(await Attachment.checksum(block))
        const item = await PluginFileServiceRPC.getFileInfo(checksum)
        if (isNil(item)) {
            history.replace(FileRouter.uploading, {
                key,
                name: file.name,
                size: file.size,
                type: file.type,
                block,
                checksum,
            })
        } else {
            history.replace(FileRouter.uploaded, item)
        }
    }
    return (
        <section className={classes.container}>
            <section className={classes.upload}>
                <UploadDropArea maxFileSize={MAX_FILE_SIZE} onFile={onFile} />
                <RecentFiles files={recent.value ?? []} />
            </section>
            <section className={classes.legal}>
                <FormControlLabel
                    control={<Checkbox checked={encrypted} onChange={(event, checked) => setEncrypted(checked)} />}
                    className={classes.encrypted}
                    label={t('plugin_file_service_on_encrypt_it')}
                />
                <Typography className={classes.legalText}>
                    <Trans
                        i18nKey="plugin_file_service_legal_text"
                        components={{
                            terms: <Link target="_blank" href={t('plugin_file_service_legal_terms_link')} />,
                            policy: <Link target="_blank" href={t('plugin_file_service_legal_policy_link')} />,
                        }}
                    />
                </Typography>
            </section>
        </section>
    )
}

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

const getRootDirectory = (file) => {
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
        <div className="home-upload">
            <div className="home-upload-white">
                <div className="home-upload-split">
                    <div className="home-upload-box ">
                        <div
                            className={classNames("home-upload-dropzone", {
                                "drop-active": isDragActive,
                            })}
                            {...getRootProps()}
                        >
                            <span className="home-upload-text">
                                <h3>Upload your {directoryMode ? "Directory" : "Files"}</h3>
                Drop your {directoryMode ? "directory" : "files"} here to pin to Skynet
              </span>
                            <Button iconLeft>
                                <Folder />
                Browse
              </Button>
                        </div>
                        <input {...getInputProps()} className="offscreen" />
                        <button
                            type="button"
                            className="home-upload-mode-switch link"
                            onClick={() => setDirectoryMode(!directoryMode)}
                        >
                            {directoryMode ? "⇐ Switch back to uploading files" : "Do you want to upload an entire directory?"}
                        </button>
                        {directoryMode && (
                            <p className="home-upload-directory-mode-notice">
                                Please note that directory upload is not a standard browser feature and the browser support is limited.
                To check whether your browser is compatible, visit{" "}
                                <a
                                    href="https://caniuse.com/#feat=mdn-api_htmlinputelement_webkitdirectory"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link"
                                >
                                    caniuse.com
                </a>
                .
                            </p>
                        )}
                    </div>

                    <div className="home-upload-retrieve">
                        <div className="home-upload-text">
                            <h3 id="skylink-retrieve-title">Have a Skylink?</h3>
                            <p>Paste the link to retrieve your file</p>

                            <form
                                className={classNames("home-upload-retrieve-form", { invalid: skylink && !isValidSkylink(skylink) })}
                                onSubmit={handleSkylink}
                            >
                                <input
                                    name="skylink"
                                    type="text"
                                    placeholder="sia://"
                                    aria-labelledby="skylink-retrieve-title"
                                    onChange={(event) => setSkylink(event.target.value)}
                                />
                                <button type="submit" aria-label="Retrieve file">
                                    <DownArrow />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="home-uploaded-files">
                        {files.map((file, i) => {
                            return <UploadFile key={i} {...file} />;
                        })}
                    </div>
                )}
            </div>

            <p className="bottom-text">
                Upon uploading a file, Skynet generates a 46 byte link called a <strong>Skylink</strong>. This link can then be
        shared with anyone to retrieve the file on any Skynet Webportal.
      </p>

            <Deco3 className="deco-3" />
            <Deco4 className="deco-4" />
            <Deco5 className="deco-5" />
        </div>
    );
}
