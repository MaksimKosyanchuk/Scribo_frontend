import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        svgr({
            include: "**/*.svg?react",
        }),
    ],
    css: {
        devSourcemap: true,
    },
    resolve: {
        alias: {
            "swagger-ui-dist/swagger-ui-es-bundle.js": path.join(
                rootDir,
                "node_modules/swagger-ui-dist/swagger-ui-es-bundle.js",
            ),
            "swagger-ui-dist/swagger-ui.css": path.join(
                rootDir,
                "node_modules/swagger-ui-dist/swagger-ui.css",
            ),
        },
    },
    server: {
        port: 3000,
    },
});
