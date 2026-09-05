import { useEffect, useState, useRef } from "react";

import "./DropFile.scss";

import DeleteIcon from "../../../assets/svg/delete.svg?react";
import WarningIcon from "../../../assets/svg/warning-icon.svg?react";
import UploadFileIcon from "../../../assets/svg/upload-file-icon.svg?react";

const DropFile = ({
    value,
    previewUrl = null,
    setValue,
    onChange,
    background = null,
    dropFileType,
    errors,
    fileTypes,
    addNewErrors,
    clearErrors,
    onRemove,
    maxSizeBytes = 4 * 1024 * 1024,
    typeError = "Incorrect type of file!",
    sizeError = "Max size of image must be 4 mb!",
}) => {
    const setFile = onChange ?? setValue;
    const [preview, setPreview] = useState(null);
    const [isPreviewHidden, setIsPreviewHidden] = useState(false);
    const [isDragged, setIsDragged] = useState(false);
    const fileRef = useRef(null);
    const inputRef = useRef(null);
    const lastPreviewUrlRef = useRef(previewUrl);

    useEffect(() => {
        if (lastPreviewUrlRef.current !== previewUrl) {
            lastPreviewUrlRef.current = previewUrl;
            setIsPreviewHidden(false);
        }
    }, [previewUrl]);

    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setIsPreviewHidden(false);
            setPreview(url);

            return () => URL.revokeObjectURL(url);
        }

        if (previewUrl && !isPreviewHidden) {
            setPreview(previewUrl);
            return;
        }

        setPreview(null);
    }, [value, previewUrl, isPreviewHidden]);

    const validateImage = (file) => {
        const errors = [];

        if (
            dropFileType &&
            dropFileType.trim() !== "" &&
            !new RegExp(dropFileType).test(file.type)
        ) {
            errors.push(typeError);
        }

        if (file.size > maxSizeBytes) {
            errors.push(sizeError);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    };

    const setFileHandler = (e) => {
        const file = e.currentTarget.files[0];
        if (!file) return;

        const validation = validateImage(file);

        if (validation.isValid) {
            setFile(file);
            clearErrors?.();
        } else {
            addNewErrors?.(validation.errors);
        }
    };

    useEffect(() => {
        if (!fileRef.current) return;

        const el = fileRef.current;

        const handleDragIn = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragged(true);
        };

        const handleDragOut = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragged(false);
        };

        const handleDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragged(false);

            if (e.dataTransfer.files.length > 0) {
                setFile(e.dataTransfer.files[0]);
            }
        };

        el.addEventListener("dragenter", handleDragIn);
        el.addEventListener("dragleave", handleDragOut);
        el.addEventListener("dragover", handleDrag);
        el.addEventListener("drop", handleDrop);

        return () => {
            el.removeEventListener("dragenter", handleDragIn);
            el.removeEventListener("dragleave", handleDragOut);
            el.removeEventListener("dragover", handleDrag);
            el.removeEventListener("drop", handleDrop);
        };
    }, [setFile]);

    return (
        <>
            <div
                ref={fileRef}
                className={`drop_file app-transition${isDragged ? " drop_file_dragged" : ""} ${
                    errors ? "drop_file_incorrect_field" : ""
                }`}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="" />
                        <div className="remove_image app-transition blurred">
                            <p>
                                {value instanceof File
                                    ? value.name
                                    : typeof value === "string"
                                    ? value.split("/").pop()
                                    : "Выбранный файл"
                                }
                            </p>
                            <button
                                className="remove_image_button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    inputRef.current && (inputRef.current.value = "");
                                    setIsPreviewHidden(true);
                                    setPreview(null);
                                    setFile(null);
                                    onRemove?.();
                                }}
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="drop_file_info">
                            {background ?? (
                                <>
                                    <UploadFileIcon className="drop_file_info_upload_icon app-transition" />
                                    <p className="drop_file_info_main_text">
                                        Выберите файл или перетащите его сюда
                                    </p>
                                    <p className="drop_file_info_help_text">{fileTypes}</p>
                                    <div className="drop_file_info_select app-transition">
                                        Выбрать
                                    </div>
                                </>
                            )}
                        </div>
                        <input
                            className="image_input"
                            type="file"
                            accept={dropFileType}
                            onChange={setFileHandler}
                            ref={inputRef}
                        />
                    </>
                )}
            </div>

            {Array.isArray(errors) && (
                <div className={`drop_file_error_messages ${errors.length ? "show" : ""}`}>
                    {errors.map((error, index) => (
                        <div key={index} className="drop_file_error_message">
                            <WarningIcon className="drop_file_error_message_logo" />
                            <p>{error}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default DropFile;
