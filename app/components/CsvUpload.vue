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

		const result = await $fetch("/api/upload", {
			method: "POST",
			body: formData,
		});

		successMessage.value = `CSV validated successfully: ${result.companyCount} companies found.`;
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
			Choose a CSV up to 1 MB with the same columns as the sample: Rank,
			Company, Region, Stage, Employees, Total Raised, Description, Website and
			Industries. Fundraising amounts must be in GBP. This step validates your
			file without saving it.
		</p>

		<form class="mt-5 space-y-4" @submit.prevent="uploadCsv">
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
				{{ uploading ? "Validating…" : "Validate CSV" }}
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
