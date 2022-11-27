<script lang="ts">
	import { getDays, getDayId } from './page';
	import IonPage from '$ionpage';
	import { currentUser } from '$services/supabase.auth.service';
	import { onMount, onDestroy } from 'svelte'
	import { addOutline } from 'ionicons/icons'
	import { goto } from '$app/navigation'
	import { getToday } from '$services/utility.functions.service';
	let settings = {
		daily_budget: 0,
		target_weight: 0,
		water_target: 8,
	}
	let days: any[] // = cache || []
	let recordset: any;
	onMount(async () => {})
	onDestroy(() => {})
	const gotoDay = (id: string) => {
		goto(`/day/${id}`)
	}
	const ionViewDidEnter = async () => {
		// console.log('** ionViewDidEnter')
		if ($currentUser?.user_metadata) {
			settings = $currentUser?.user_metadata
		} else {
			settings = {
				daily_budget: 0,
				target_weight: 0,
				water_target: 8,
			}
		}
		if (!recordset) {
			// console.log('loading subscription here, user', $currentUser)

			const { data, error } = await getDays();
			if (error) {
				console.log('error', error)
			} else {
				// console.log('data', data)
				if (data) {
					days = data;
				}
			}
		} else {
			// console.log('*** attempted to re-assign recordset subscription', days);
		}
	}
	const ionViewWillLeave = () => {
		days = []
	}
	function toggleDatePicker() {
		console.log('** toggleDatePicker');
		const el = document.getElementById('datepicker');
		if (el) {
			el.classList.toggle('hidden');
		}
	}
	const handleDate = async (event: any) => {
		const theDate = new Date(event.target.value);
		const { data, error } = await getDayId(theDate.toISOString().substring(0,10));
		if (data && data.id) {
			gotoDay(data.id);
		} else {
			//console.log('** handleDate', data, error);
			gotoDay(theDate.toISOString().substring(0,10));
		}
		// day.date = event.target.value
	}

</script>

<IonPage {ionViewDidEnter} {ionViewWillLeave}>
	<ion-header translucent="true">
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-menu-button />
			</ion-buttons>
			<ion-title on:click={toggleDatePicker}>Calendar</ion-title>
			<ion-buttons slot="end">
				<ion-button on:click={() => gotoDay('new')}>
					<ion-icon slot="icon-only" icon={addOutline} />
				</ion-button>
			</ion-buttons>
		</ion-toolbar>
	</ion-header>

	<ion-content class="ion-padding">
		<div class="centered">
			<ion-datetime id="datepicker" class="hidden" on:click={handleDate}></ion-datetime>
		</div>
		<ion-list>
			{#if days && days.length}
				{#each days as day}
					<ion-item
						on:click={() => gotoDay(day.id)}
						class={getToday() === day.date ? 'today' : 'notToday'}
					>
						{#if getToday() === day.date}
							Today
						{:else}
							{new Date(
								new Date(day?.date).getTime() + new Date(day?.date).getTimezoneOffset() * 60000
							).toDateString()}
						{/if}
						<ion-note slot="end" class={getToday() === day.date ? 'today' : 'notToday'}>
							{#if getToday() === day.date && settings?.daily_budget}
								<b>[{settings?.daily_budget - (day?.food_total || 0).toFixed(2)}]&nbsp;&nbsp;</b>
							{/if}
							{(day?.food_total || 0).toFixed(2)}
						</ion-note>
					</ion-item>
				{/each}
			{:else}
				<ion-item> No days found </ion-item>
			{/if}
		</ion-list>
		<!-- currentUser: {$currentUser?.id}<br/>
	settings: {JSON.stringify(settings)}<br/> -->
	</ion-content>
</IonPage>

<style>
	.today {
		font-weight: bold;
	}
	.notToday {
		font-weight: normal;
	}
	.centered {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.hidden {
		display: none;
	}
</style>
