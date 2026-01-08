/*
 * @Date: 2026-01-08 09:04:29
 * @LastEditTime: 2026-01-08 16:15:25
 * @Description: file content
 */
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uni(),
        AutoImport({
            imports: ["vue", "uni-app", "pinia", "vue-i18n"],
            dts: resolve(__dirname, "auto-imports.d.ts"),
            eslintrc: {
                enabled: true,
                filepath: resolve(__dirname, ".eslintrc-auto-import.json"),
                globalsPropValue: true,
            },
            dirs: [
                resolve(__dirname, "src/hooks/**"),
                resolve(__dirname, "src/store/modules"),
                resolve(__dirname, "src/utils/*"),
            ],
            vueTemplate: true,
            include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
            exclude: [/node_modules/, /\.git/, /dist/],
        }),
        Components({
            dts: "components.d.ts",
            dirs: ["src/components"],
            extensions: ["vue"],
            deep: true,
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@components": resolve(__dirname, "src/components"),
            "@utils": resolve(__dirname, "src/utils"),
            "@hooks": resolve(__dirname, "src/hooks"),
            "@store": resolve(__dirname, "src/store"),
        },
    },
    root: process.cwd(),
    server: {
        port: 8080,
        open: true,
        proxy: {
            // 代理配置
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },

    build: {
        target: "es2015",
        minify: "terser",
        assetsInlineLimit: 4096,
        reportCompressedSize: true,
        chunkSizeWarningLimit: 1000,
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                assetFileNames: `static/[ext]/[name].[hash].${new Date().getTime()}[extname]`,
                entryFileNames: `static/js/[name].[hash].${new Date().getTime()}.js`,
                chunkFileNames: `static/js/[name].[hash].${new Date().getTime()}.js`,
                manualChunks: {
                    "vue-vendor": ["vue", "vue-router", "pinia"],
                    "uni-vendor": ["@dcloudio/uni-app"],
                },
            },
        },
    },
});
