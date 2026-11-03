<script setup lang="ts">
useSeoMeta({
	title: "UK Fintech Companies | Company Insights",
	description:
		"Explore 100 UK seed-stage fintech companies, their fundraising, regions and business activities.",
});
</script>

<template>
	<main class="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
		<div class="mx-auto max-w-6xl">
			<header class="mb-10">
				<p
					class="mb-4 text-sm font-semibold uppercase tracking-widest text-teal-700"
				>
					Company Insights
				</p>

				<h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
					100 UK Seed-Stage Fintech Companies
				</h1>

				<p class="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
					Explore the companies in our dataset, ranked by total fundraising.
				</p>
			</header>

			<section
				aria-labelledby="rankings-heading"
				class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
			>
				<h2 id="rankings-heading" class="text-2xl font-semibold">
					Company rankings
				</h2>

				<p class="mt-3 text-slate-600">
					Our company ranking table will appear here.
				</p>
			</section>
		</div>
	</main>
</template>
