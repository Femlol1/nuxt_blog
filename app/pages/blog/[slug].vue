<script setup lang="ts">
definePageMeta({
	key: (route) => route.fullPath,
});

const route = useRoute();
const slug = String(route.params.slug);

const { data: blog, error } = await useFetch(
	`/api/blogs/${encodeURIComponent(slug)}`,
);

if (error.value) {
	throw createError({
		statusCode: error.value.statusCode ?? 500,
		statusMessage:
			error.value.statusCode === 404
				? "Blog not found."
				: "Unable to load this blog.",
	});
}

if (!blog.value) {
	throw createError({
		statusCode: 404,
		statusMessage: "Blog not found.",
	});
}

useSeoMeta({
	title: () => blog.value?.copy.title ?? "Company Insights",
	description: () => blog.value?.copy.metaDescription ?? "",
	ogTitle: () => blog.value?.copy.title ?? "Company Insights",
	ogDescription: () => blog.value?.copy.metaDescription ?? "",
	ogType: "article",
});

const formatter = new Intl.NumberFormat("en-GB", {
	style: "currency",
	currency: "GBP",
	maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
	return formatter.format(amount);
}
</script>

<template>
	<main v-if="blog" class="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
		<article class="mx-auto max-w-6xl">
			<NuxtLink
				to="/"
				class="font-medium text-teal-700 underline underline-offset-4"
			>
				Back to Company Insights
			</NuxtLink>

			<header class="my-10">
				<h1 class="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
					{{ blog.copy.title }}
				</h1>

				<p class="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
					{{ blog.copy.introduction }}
				</p>
			</header>

			<section aria-labelledby="summary-heading" class="mb-10">
				<h2 id="summary-heading" class="mb-4 text-2xl font-semibold">
					Dataset at a glance
				</h2>

				<dl class="grid gap-4 md:grid-cols-3">
					<div class="rounded-xl border border-slate-200 bg-white p-6">
						<dt class="text-sm text-slate-600">Companies analysed</dt>
						<dd class="mt-2 text-2xl font-bold">
							{{ blog.statistics.companyCount }}
						</dd>
					</div>

					<div class="rounded-xl border border-slate-200 bg-white p-6">
						<dt class="text-sm text-slate-600">Total fundraising</dt>
						<dd class="mt-2 text-2xl font-bold text-teal-700">
							{{ formatCurrency(blog.statistics.totalRaised) }}
						</dd>
					</div>

					<div class="rounded-xl border border-slate-200 bg-white p-6">
						<dt class="text-sm text-slate-600">Average fundraising</dt>
						<dd class="mt-2 text-2xl font-bold">
							{{ formatCurrency(blog.statistics.averageRaised) }}
						</dd>
					</div>
				</dl>

				<p class="mt-3 text-sm text-slate-500">
					Figures reflect the uploaded dataset. Amounts are rounded to the
					nearest pound.
				</p>
			</section>

			<section
				v-for="(section, index) in blog.copy.sections"
				:key="index"
				class="mb-8 max-w-3xl"
			>
				<h2 class="text-2xl font-semibold">{{ section.heading }}</h2>
				<p class="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
					{{ section.body }}
				</p>
			</section>

			<section
				aria-labelledby="rankings-heading"
				class="rounded-2xl border border-slate-200 bg-white p-6"
			>
				<h2 id="rankings-heading" class="text-2xl font-semibold">
					Company rankings
				</h2>

				<div
					role="region"
					aria-label="Company rankings, scroll horizontally on small screens"
					tabindex="0"
					class="mt-6 overflow-x-auto focus-visible:outline-2 focus-visible:outline-teal-700"
				>
					<table class="w-full min-w-175 text-left text-sm">
						<caption class="sr-only">
							All companies ordered by rank from the uploaded dataset
						</caption>

						<thead class="border-b border-slate-200 bg-slate-100">
							<tr>
								<th scope="col" class="p-3">Rank</th>
								<th scope="col" class="p-3">Company</th>
								<th scope="col" class="p-3">Region</th>
								<th scope="col" class="p-3">Stage</th>
								<th scope="col" class="p-3">Employees</th>
								<th scope="col" class="p-3 text-right">Total raised</th>
							</tr>
						</thead>

						<tbody class="divide-y divide-slate-100">
							<tr v-for="company in blog.companies" :key="company.rank">
								<td class="p-3">{{ company.rank }}</td>
								<th scope="row" class="p-3 font-semibold">
									{{ company.name }}
								</th>
								<td class="p-3">{{ company.region }}</td>
								<td class="p-3">{{ company.stage }}</td>
								<td class="p-3">{{ company.employees }}</td>
								<td class="whitespace-nowrap p-3 text-right tabular-nums">
									{{ formatCurrency(company.totalRaised) }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<p class="mt-6 text-sm text-slate-500">
				Commentary generated with AI from the uploaded dataset. Figures describe
				this dataset and may not represent the wider market.
			</p>
		</article>
	</main>
</template>
