<script lang="ts">
	import IonPage from '$ionic/svelte/components/IonPage.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { load_today } from './page';
	import { dayID } from '$stores/day';
	import { currentUser } from '$services/supabase.auth.service';

	onMount(async () => {
		console.log('root page onmount here', $currentUser);
		if ($currentUser) {
			const { data, error } = await load_today();
			if (data && data.id) {
				const id = data.id;
				dayID.set(id);
			} else {
				dayID.set('new');
			}
			goto('/day');
		} else {
			goto('/info');
		}
	});
</script>

<svelte:head>
	<title>Diet Tracker</title>
</svelte:head>

<IonPage>
	<ion-header translucent="true">
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-menu-button />
			</ion-buttons>
			<ion-title>Diet Tracker</ion-title>
		</ion-toolbar>
	</ion-header>

	<ion-content class="ion-padding"> Landing Page Here... </ion-content>
</IonPage>
