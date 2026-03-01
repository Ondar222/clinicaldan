import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { join } from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// Явно отдаём статические страницы успеха/отмены из public/ с no-cache, чтобы не подставлялся закэшированный index.html
		{
			name: "serve-certificates-static",
			configureServer(server) {
				const publicDir = join(process.cwd(), "public");
				server.middlewares.use((req, res, next) => {
					const pathname = (req.url ?? "").split("?")[0];
					if (req.method !== "GET") { next(); return; }
					const file =
						pathname === "/certificates-success.html"
							? "certificates-success.html"
							: pathname === "/certificates-cancel.html"
								? "certificates-cancel.html"
								: null;
					if (!file) { next(); return; }
					try {
						const html = readFileSync(join(publicDir, file), "utf-8");
						res.setHeader("Content-Type", "text/html; charset=utf-8");
						res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
						res.setHeader("Pragma", "no-cache");
						res.statusCode = 200;
						res.end(html);
					} catch {
						next();
					}
				});
			},
		},
		// Редирект /certificates/success → статическая страница (чтобы после банка всегда открывался чек, без 404 на /assets/index-*.js)
		{
			name: "redirect-certificates-pages",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const url = req.url ?? "";
					const pathname = url.split("?")[0];
					const query = url.includes("?") ? url.slice(url.indexOf("?")) : "";
					if (req.method !== "GET") { next(); return; }
					if (pathname === "/certificates/success") {
						res.statusCode = 302;
						res.setHeader("Location", "/certificates-success.html" + query);
						res.setHeader("Cache-Control", "no-store");
						res.end();
						return;
					}
					if (pathname === "/certificates/cancel") {
						res.statusCode = 302;
						res.setHeader("Location", "/certificates-cancel.html" + query);
						res.setHeader("Cache-Control", "no-store");
						res.end();
						return;
					}
					next();
				});
			},
		},
		// Явно отдаём index.html для /certificates (SPA), чтобы всегда загружалось приложение, а не кэш/ошибка
		{
			name: "spa-fallback-certificates",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const pathname = (req.url ?? "").split("?")[0];
					if (req.method !== "GET" || pathname !== "/certificates") { next(); return; }
					try {
						const indexHtml = readFileSync(join(process.cwd(), "index.html"), "utf-8");
						res.setHeader("Content-Type", "text/html; charset=utf-8");
						res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
						res.setHeader("Pragma", "no-cache");
						res.statusCode = 200;
						res.end(indexHtml);
					} catch {
						next();
					}
				});
			},
		},
		{
			name: "no-cache-html",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const pathname = req.url?.split("?")[0] ?? "";
					const isPageRequest = !pathname.match(/\.(js|css|tsx?|jsx|json|ico|png|svg|woff2?|map)(\?|$)/i);
					if (req.method === "GET" && isPageRequest) {
						res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
						res.setHeader("Pragma", "no-cache");
					}
					next();
				});
			},
		},
	],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:5002',
				changeOrigin: true,
				secure: false,
			},
			'/certificate': {
				target: 'http://localhost:5002',
				changeOrigin: true,
				secure: false,
			},
			'/vk': {
				target: 'http://localhost:5002',
				changeOrigin: true,
				secure: false,
			},
		}
	},
	build: {
		outDir: "dist",
		sourcemap: false,
		minify: "esbuild",
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom', 'react-router-dom'],
					sw: ['swr'],
				}
			}
		}
	}
});
