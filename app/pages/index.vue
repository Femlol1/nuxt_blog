<script setup lang="ts">
useSeoMeta({
	title: "UK Fintech Companies | Company Insights",
	description:
		"Explore 100 UK seed-stage fintech companies, their fundraising, regions and business activities.",
});
const {
	data: savedBlogs,
	status: blogsStatus,
	error: blogsError,
} = await useFetch("/api/blogs");

const { data: companies, status, error } = await useFetch("/api/companies");

const currencyFormatter = new Intl.NumberFormat("en-GB", {
	style: "currency",
	currency: "GBP",
	maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
	return currencyFormatter.format(amount);
}
const statistics = computed(() => {
	const rows = companies.value ?? [];

	const totalRaised = rows.reduce(
		(total, company) => total + company.totalRaised,
		0,
	);

	return {
		companyCount: rows.length,
		totalRaised,
		averageRaised: rows.length > 0 ? totalRaised / rows.length : 0,
	};
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
			<CsvUpload />
			<section aria-labelledby="blogs-heading" class="mb-10">
				<h2 id="blogs-heading" class="mb-4 text-2xl font-semibold">
					Latest company insights
				</h2>

				<p
					v-if="blogsStatus === 'pending'"
					role="status"
					class="text-slate-600"
				>
					Loading saved blogs…
				</p>

				<p v-else-if="blogsError" role="alert" class="text-red-700">
					Saved blogs could not be loaded. Please refresh to try again.
				</p>

				<div v-else-if="savedBlogs?.length" class="grid gap-4 md:grid-cols-2">
					<article
						v-for="blog in savedBlogs"
						:key="blog.slug"
						class="rounded-2xl border border-slate-200 bg-white p-6"
					>
						<p class="mb-3 text-sm font-medium text-teal-700">
							{{ blog.companyCount }} companies analysed
						</p>

						<h3 class="text-xl font-semibold">
							<NuxtLink
								:to="`/blog/${blog.slug}`"
								class="underline decoration-slate-300 underline-offset-4 hover:text-teal-700"
							>
								{{ blog.title }}
							</NuxtLink>
						</h3>

						<p class="mt-3 leading-relaxed text-slate-600">
							{{ blog.description }}
						</p>
					</article>
				</div>

				<p v-else class="text-slate-600">
					No blogs have been generated yet. Upload a dataset to create one.
				</p>
			</section>
			<section
				v-if="status === 'success' && companies?.length"
				aria-labelledby="statistics-heading"
				class="mb-10"
			>
				<h2 id="statistics-heading" class="mb-4 text-2xl font-semibold">
					Dataset at a glance
				</h2>

				<dl class="grid gap-4 md:grid-cols-3">
					<div class="rounded-2xl border border-slate-200 bg-white p-6">
						<dt class="text-sm font-medium text-slate-600">
							Companies analysed
						</dt>
						<dd class="mt-2 text-3xl font-bold text-slate-900">
							{{ statistics.companyCount }}
						</dd>
					</div>

					<div class="rounded-2xl border border-slate-200 bg-white p-6">
						<dt class="text-sm font-medium text-slate-600">
							Total fundraising
						</dt>
						<dd class="mt-2 wrap-break-word text-3xl font-bold text-teal-700">
							{{ formatCurrency(statistics.totalRaised) }}
						</dd>
					</div>

					<div class="rounded-2xl border border-slate-200 bg-white p-6">
						<dt class="text-sm font-medium text-slate-600">
							Average fundraising
						</dt>
						<dd class="mt-2 wrap-break-word text-3xl font-bold text-slate-900">
							{{ formatCurrency(statistics.averageRaised) }}
						</dd>
					</div>
				</dl>

				<p class="mt-3 text-sm text-slate-500">
					Figures reflect the supplied dataset. Amounts are displayed to the
					nearest pound.
				</p>
			</section>
			<section
				aria-labelledby="rankings-heading"
				class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
			>
				<h2 id="rankings-heading" class="text-2xl font-semibold">
					Company rankings
				</h2>

				<p
					v-if="status === 'pending'"
					role="status"
					class="mt-4 text-slate-600"
				>
					Loading companies…
				</p>

				<p v-else-if="error" role="alert" class="mt-4 text-red-700">
					We couldn’t load the companies. Please refresh the page to try again.
				</p>

				<template v-else-if="companies?.length">
					<p class="mt-3 text-slate-600">
						Showing {{ companies.length }} companies, ordered by the dataset’s
						rank.
					</p>

					<div
						class="mt-6 overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-teal-700"
						role="region"
						aria-label="Company rankings table, scroll horizontally on smaller screens"
						tabindex="0"
					>
						<table class="w-full min-w-175 text-left text-sm">
							<caption class="sr-only">
								UK seed-stage fintech companies ranked by total fundraising
							</caption>

							<thead
								class="border-b border-slate-200 bg-slate-50 text-slate-600"
							>
								<tr>
									<th scope="col" class="px-4 py-3">Rank</th>
									<th scope="col" class="px-4 py-3">Company</th>
									<th scope="col" class="px-4 py-3">Region</th>
									<th scope="col" class="px-4 py-3">Stage</th>
									<th scope="col" class="px-4 py-3">Employees</th>
									<th scope="col" class="px-4 py-3 text-right">Total raised</th>
								</tr>
							</thead>

							<tbody class="divide-y divide-slate-100">
								<tr
									v-for="company in companies"
									:key="company.rank"
									class="hover:bg-slate-50"
								>
									<td class="px-4 py-4 text-slate-500">
										{{ company.rank }}
									</td>
									<th scope="row" class="px-4 py-4 font-semibold">
										{{ company.name }}
									</th>
									<td class="px-4 py-4">{{ company.region }}</td>
									<td class="px-4 py-4">{{ company.stage }}</td>
									<td class="px-4 py-4">{{ company.employees }}</td>
									<td
										class="whitespace-nowrap px-4 py-4 text-right tabular-nums"
									>
										{{ formatCurrency(company.totalRaised) }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</template>

				<p v-else class="mt-4 text-slate-600">No companies were found.</p>
			</section>
		</div>
	</main>
</template>
