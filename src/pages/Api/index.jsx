import { useEffect, useContext, useState } from "react";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import "./Api.scss";

import { AppContext } from "../../App";

const isApiOutdated = (docsVersion, backendVersion) => {
    if (!docsVersion || !backendVersion) {
        return false;
    }

    const [docsMajor, docsMinor] = docsVersion.split(".");
    const [backendMajor, backendMinor] = backendVersion.split(".");

    return (
        docsMajor !== backendMajor ||
        docsMinor !== backendMinor
    );
};

function Api() {
    const { isDarkTheme } = useContext(AppContext);

    const [apiDocument, setApiDocument] = useState(null);

    useEffect(() => {
        const loadApiDocument = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/docs`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch API docs: ${response.status}`
                    );
                }

                const data = await response.json();

                console.log("API documentation:", data);
                console.log("API version:", data.info?.version);
                console.log(
                    "Backend version:",
                    data.info?.["x-backend-version"]
                );

                setApiDocument(data);
            } catch (error) {
                console.error("Failed to load API documentation:", error);
            }
        };

        loadApiDocument();
    }, []);

    useEffect(() => {
        if (!apiDocument) return;

        const outdated = isApiOutdated(
            apiDocument.info?.version,
            apiDocument.info?.["x-backend-version"]
        );

        if (!outdated) return;

        const addOutdatedLabel = () => {
            const badges = document.querySelectorAll(".badge");

            badges.forEach((badge) => {
                if (
                    badge.textContent.includes(apiDocument.info.version) &&
                    !badge.querySelector(".outdated-label")
                ) {
                    const label = document.createElement("p");

                    label.className = "outdated-label";
                    label.textContent = "Outdated";

                    badge.appendChild(label);
                }
            });
        };

        const observer = new MutationObserver(addOutdatedLabel);

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        addOutdatedLabel();

        return () => observer.disconnect();
    }, [apiDocument]);

    if (!apiDocument) {
        return null;
    }

    return (
        <ApiReferenceReact
            configuration={{
                content: apiDocument,
                forceDarkModeState: isDarkTheme ? "dark" : "light",
                hideDarkModeToggle: true
            }}
        />
    );
}

export default Api;