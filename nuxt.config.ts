// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	css: ["~/assets/css/main.css"],
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	vite: {
		plugins: [tailwindcss()],
	},
	runtimeConfig: {
		geminiApiKey: "",
		geminiModel: "gemini-3.8-flash",
	},
});

import tailwindcss from "@tailwindcss/vite";
