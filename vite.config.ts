import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, createReadStream, existsSync } from "fs";
import { join, extname } from "path";

// MIME types для документов
const MIME_TYPES: Record<string, string> = {
	".pdf": "application/pdf",
	".doc": "application/msword",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
};

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// Отдача файлов из /documents/ с правильным Content-Type
		{
			name: "serve-documents",
			configureServer(server) {
				const publicDir = join(process.cwd(), "public");
				server.middlewares.use((req, res, next) => {
					const pathname = (req.url ?? "").split("?")[0];
					if (!pathname.startsWith("/documents/")) { next(); return; }
					if (req.method !== "GET") { next(); return; }
					
					const fileName = pathname.replace("/documents/", "");
					const filePath = join(publicDir, "documents", fileName);
					
					if (!existsSync(filePath)) { next(); return; }
					
					const ext = extname(filePath).toLowerCase();
					const contentType = MIME_TYPES[ext] || "application/octet-stream";
					
					res.setHeader("Content-Type", contentType);
					res.setHeader("Cache-Control", "public, max-age=31536000");
					res.statusCode = 200;
					createReadStream(filePath).pipe(res);
				});
			},
		},
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
			// Сначала более специфичные пути (Directus на 8055)
			'/api/directus': {
				target: 'http://localhost:8055',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api\/directus/, ''),
			},
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
			'/api/certificate': {
				target: 'http://localhost:5002',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api\/certificate/, '/certificate'),
			},
			'/vk': {
				target: 'http://localhost:5002',
				changeOrigin: true,
				secure: false,
			},
		}
	},
	preview: {
		proxy: {
			'/api/directus': {
				target: 'http://localhost:8055',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api\/directus/, ''),
			},
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
			'/api/certificate': {
				target: 'http://localhost:5002',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api\/certificate/, '/certificate'),
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
	},
	// Копирование SEO-файлов при сборке
	publicDir: "public",
});
