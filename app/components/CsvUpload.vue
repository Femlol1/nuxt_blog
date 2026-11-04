<script setup lang="ts">
import { FetchError } from "ofetch";

const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

function selectFile(event: Event) {
	const input = event.target as HTMLInputElement;
	selectedFile.value = input.files?.[0] ?? null;
	errorMessage.value = "";
	successMessage.value = "";
}
const industry = ref("");

async function uploadCsv() {
	errorMessage.value = "";
	successMessage.value = "";

	const file = selectedFile.value;

	if (!file) {
		errorMessage.value = "Please select a CSV file.";
		return;
	}

	if (file.size > 1024 * 1024) {
		errorMessage.value = "The CSV must be 1 MB or smaller.";
		return;
	}

	uploading.value = true;

	try {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("industry", industry.value.trim());

		const result = await $fetch("/api/upload", {
			method: "POST",
			body: formData,
		});

		await navigateTo(result.url);
	} catch (error) {
		errorMessage.value =
			error instanceof FetchError
				? (error.data?.data?.message ??
					error.data?.statusMessage ??
					"Upload failed. Please try again.")
				: "Upload failed. Please try again.";
	} finally {
		uploading.value = false;
	}
}
</script>

<template>
	<section
		aria-labelledby="upload-heading"
		class="mb-10 rounded-2xl border border-slate-200 bg-white p-6"
	>
		<h2 id="upload-heading" class="text-2xl font-semibold">
			Upload a company dataset
		</h2>

		<p id="upload-help" class="mt-3 text-sm leading-relaxed text-slate-600">
			Upload a comma-separated UTF-8 CSV up to 1 MB and 1,000 companies. Company
			and Total Raised are required; common header aliases are supported. Other
			descriptive columns are optional. Amounts must be in GBP. Ranks are
			calculated from fundraising, with ties retaining file order. Uploading
			sends the data to Gemini and saves a publicly accessible article.
		</p>

		<form class="mt-5 space-y-4" @submit.prevent="uploadCsv">
			<div>
				<label for="industry" class="mb-2 block text-sm font-medium">
					Industry (optional)
				</label>

				<input
					id="industry"
					v-model="industry"
					type="text"
					maxlength="80"
					placeholder="For example, fintech or healthtech"
					:disabled="uploading"
					aria-describedby="industry-help"
					class="block w-full rounded-lg border border-slate-300 p-3"
				/>

				<p id="industry-help" class="mt-2 text-sm text-slate-600">
					Helps focus the article. Leave blank to infer the industry from the
					CSV.
				</p>
			</div>
			<div>
				<label for="company-csv" class="mb-2 block text-sm font-medium">
					Company CSV
				</label>

				<input
					id="company-csv"
					type="file"
					accept=".csv"
					required
					aria-describedby="upload-help"
					:disabled="uploading"
					class="block w-full rounded-lg border border-slate-300 p-3 text-sm"
					@change="selectFile"
				/>
			</div>

			<button
				type="submit"
				:disabled="uploading || !selectedFile"
				class="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{{ uploading ? "Generating and saving…" : "Generate blog" }}
			</button>

			<p v-if="errorMessage" role="alert" class="text-sm text-red-700">
				{{ errorMessage }}
			</p>

			<p v-if="successMessage" role="status" class="text-sm text-teal-700">
				{{ successMessage }}
			</p>
		</form>
	</section>
</template>
