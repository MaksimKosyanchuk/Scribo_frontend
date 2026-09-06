import { useEffect, useMemo, useRef, useState } from "react";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-es-bundle.js";
import "swagger-ui-dist/swagger-ui.css";
import "./Api.scss";

import { getApiDocs } from "../../api/backend.api";
import { getAccessToken } from "../../api/http";

const isApiOutdated = (docsVersion, backendVersion) => {
    if (!docsVersion || !backendVersion) {
        return false;
    }

    const [docsMajor, docsMinor] = docsVersion.split(".");
    const [backendMajor, backendMinor] = backendVersion.split(".");

    return docsMajor !== backendMajor || docsMinor !== backendMinor;
};

function interceptSwaggerRequest(request) {
    const token = getAccessToken();

    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }

    request.credentials = "include";
    return request;
}

function Api() {
    const swaggerRoot = useRef(null);
    const [apiDocument, setApiDocument] = useState(null);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadApiDocument = async () => {
            const docs = await getApiDocs();

            if (cancelled) {
                return;
            }

            if (docs?.status && docs.data) {
                setApiDocument(docs.data);
                setLoadError(false);
                return;
            }

            setLoadError(true);
        };

        loadApiDocument();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const node = swaggerRoot.current;

        if (!apiDocument || !node) {
            return undefined;
        }

        SwaggerUIBundle({
            spec: apiDocument,
            domNode: node,
            docExpansion: "list",
            defaultModelsExpandDepth: 1,
            deepLinking: true,
            filter: true,
            persistAuthorization: true,
            tryItOutEnabled: true,
            withCredentials: true,
            requestInterceptor: interceptSwaggerRequest,
        });

        return () => {
            node.replaceChildren();
        };
    }, [apiDocument]);

    const outdated = useMemo(
        () =>
            isApiOutdated(
                apiDocument?.info?.version,
                apiDocument?.info?.["x-backend-version"],
            ),
        [apiDocument],
    );

    if (loadError) {
        return (
            <p className="api-docs_status">
                Не удалось загрузить описание API.
            </p>
        );
    }

    if (!apiDocument) {
        return null;
    }

    return (
        <div className="api-docs">
            {outdated ? (
                <p className="api-docs_outdated">
                    Спека {apiDocument.info.version} не совпадает с бэкендом{" "}
                    {apiDocument.info["x-backend-version"]}
                </p>
            ) : null}
            <div ref={swaggerRoot} />
        </div>
    );
}

export default Api;
