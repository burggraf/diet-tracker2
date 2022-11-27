<script lang="ts">
	// import { IonReorderGroup } from '@ionic/core/components/ion-reorder-group';
	import IonPage from '$ionpage';
	import { dayID as id } from '$stores/day'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { getDay, getNextFreeDay, getDayId, 
		getCurrentWeight, save_day, delete_day } from './page';
	import { toast } from '$services/toast'
	import {
		chevronBackOutline,
		createOutline,
		checkmarkOutline,
		closeOutline,
		trashOutline,
		addCircleOutline,
		removeCircleOutline,
	} from 'ionicons/icons';
	import { modalController } from '$ionic/svelte';
	import FoodEntryModal from './FoodEntryModal.svelte';

	import { alert, showConfirm } from '$services/alert';
	import { currentUser } from '$services/supabase.auth.service';

	import { onDestroy, onMount } from 'svelte';
	import { gen_random_uuid } from '$services/utility.functions.service';

	// let id: string = ($page.url.search || '').replace(/\?/g,'');
	if (!$id) {
		goto('/calendar');
	}
	let day: any = {} ;// = cache || {}
	let recordset: any;

	const init = async () => {
		if ($id === 'new') {
			day = {
					id: gen_random_uuid(),
					user_id: $currentUser?.id || null,
					created_at: new Date().toISOString(),
					date: new Date().toISOString().substring(0, 10),
					food_log: { entries: [] },
					food_total: 0,
					activity_log: { entries: [] },
					water_log: { entries: [] },
					water_total: 0,
					weight: 0,
					notes: '',
				}

			// do we have an entry for today already?
			const { data, error } = await getDayId(
				new Date().toISOString().substring(0, 10)
			)
			console.log('getDayId', data, error);
			if (data && data.id) {
				const { data, error } = await getNextFreeDay()
				if (error) {
					console.error('getNextFreeDay error', error)
				} else {
					$id = data;
					day = {
						id: gen_random_uuid(),
						user_id: $currentUser?.id || null,
						created_at: new Date().toISOString(),
						date: new Date(data).toISOString().substring(0, 10),
						food_log: { entries: [] },
						food_total: 0,
						activity_log: { entries: [] },
						water_log: { entries: [] },
						water_total: 0,
						weight: 0,
						notes: '',
					}
				}
			}} else if ($id.length === 10) {
			// new specific date sent in url
			day = {
				id: gen_random_uuid(),
				user_id: $currentUser?.id || null,
				created_at: new Date().toISOString(),
				date: id,
				food_log: { entries: [] },
				food_total: 0,
				activity_log: { entries: [] },
				water_log: { entries: [] },
				water_total: 0,
				weight: 0,
				notes: '',
			}
			$id = day.id
		} else {
			console.log('calling getDay with $id', $id);
			const { data, error } = await getDay($id);
			if (error) {
				console.error('getDay error', error)
			} else {
				day = data;
			}
		}
	}
	init();

	onMount(async () => {
		if (!$currentUser) {
			goto('/info')
			return
		}
		if ($id === 'new') {
			try {
				const { data, error } = await getCurrentWeight()
				if (error) {
					console.error('getCurrentWeight error', error)
					day.weight = 0
				} else {
					day.weight = data.weight
				}
			} catch (ex) {
				console.error('exception', ex)
				day.weight = 0
			}
		}
	})

	onDestroy(() => {
		try {
			if (recordset) recordset.unsubscribe()
		} catch (err) {
			console.error('error unsubscribing', err)
		}
	})

	const handler = (event) => {
		if (typeof day[event.target.name] === 'number') {
			try {
				day[event.target.name] = parseFloat(event.target.value)
			} catch (e) {
				day[event.target.name] = 0
			}
		} else {
			// string or object
			day[event.target.name] = event.target.value
		}
	}
	const handleDate = (event) => {
		day.date = new Date(event.target.value)
		// day.date = event.target.value
	}
	const save = async () => {
		// validate here...
		if (!day.user_id) {
			day.user_id = $currentUser.id
		}
		try {
			day.food_total = 0
			day.food_log.entries.forEach((entry) => {
				day.food_total += (entry?.amt || 0)
			})
		} catch (err) {
			console.error('error calculating food total', err)
		}
		const { error } = await save_day(day)
		if (error) {
			console.error('save_day error', error.message)
			if (error.message.startsWith('duplicate key value violates unique constraint')) {
				alert({
					header: 'Duplicate Day',
					//subHeader: '',
					message: 'This day already exists.  Please edit the existing day.',
				})
			} else {
				console.error('save day error', error)
			}
		} else {
			$id = day.id
		}
	}
	const do_delete_day = async () => {
		await showConfirm({
			header: 'Delete Day',
			message: 'Are you sure?',
			okHander: async () => {
				const { data, error } = await delete_day(day)
				if (error) {
					console.error('Error deleting day', error)
				} else {
					goBack()
					// window.location.href = '/calendar'
				}
			},
		})
	}
	const goBack = () => {
		goto(`/calendar`)
	}
	const add_food_log_entry = async (id) => {
		if (!day.food_log.entries) {
			day.food_log.entries = []
		}
		const entry = {
			id: gen_random_uuid(),
			food_id: '',
			title: '',
			desc: '',
			cat: '',
			cps: 0,
			qty: 1.0,
			amt: 0,
			created: new Date().toISOString(),
		}

		const saved = await openFoodEntryBox(entry, day.food_log.entries.length, true)
		day.food_log.entries = [...day.food_log.entries]
		save()
	}
	const edit_food_log_entry = async (index: number) => {
		const saved = await openFoodEntryBox(day.food_log.entries[index], index, false)
		day.food_log.entries = [...day.food_log.entries]
		save()
	}

	const reorder_food_log = ({ detail }) => {
		// const el: any = document.getElementById('food_log_group');
		const { from, to } = detail
		const item = day.food_log.entries.splice(from, 1)[0]
		day.food_log.entries.splice(to, 0, item)
		const newItems = [...day.food_log.entries]
		save();
		detail.complete(newItems);
	}

	const openFoodEntryBox = async (entry: any, index: number, isNew: boolean) => {
		const openFodEntryModalController = await modalController.create({
			component: FoodEntryModal,
			componentProps: {
				entry: entry || {},
				isNew: isNew,
			},
			showBackdrop: true,
			backdropDismiss: true,
		})

		await openFodEntryModalController.present()
		const { data } = await openFodEntryModalController.onWillDismiss()
		if (data?.data !== null) {
			if (data.data.deleted) {
				// check for deleted entry...
				day.food_log.entries.splice(index, 1)
			} else {
				day.food_log.entries[index] = data.data
			}
			return true
		} else {
			return false
		}
	}
	async function upWater() {
		day.water_log.entries.push({
			id: gen_random_uuid(),
			amt: 1,
			created: new Date().toISOString(),
		})
		day.water_total++
		save()
	}
	async function downWater() {
		if (day.water_total <= 0) return
		// find the last entry and delete it
		day.water_log.entries.pop()
		day.water_total--
		save()
	}
	function handleNumberValue(event) {
		try {
			day[event.target.name] = parseFloat(event.target.value!) || 0
		} catch (err) {
			console.error('handleNumberValue error', err)
			day[event.target.name] = 0
		}
	}
	function focusOnNumericInput(event) {
		event.target.scrollTop = 0
		try {
			if ((parseFloat(event.target.value!) || 0) === 0) {
				event.target.value = ''
			}
		} catch (err) {
			console.error('error clearing zero value', err)
		}
	}
	function saveOnBlur(event) {
		save()
	}
	function toggleDatePicker() {
		const el = document.getElementById('datepicker')
		if ($id == 'new' || $id.length === 10) {
			if (el) {
				el.classList.toggle('hidden')
			}
		} else {
			if (!el.classList.contains('hidden')) {
				el.classList.add('hidden')
			}
		}
	}
</script>

<IonPage>
	<ion-header translucent="true">
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-button
					on:click={() => {
						//history.back()
						// window.location.href = '/days'
						goBack()
					}}
				>
					<ion-icon slot="icon-only" icon={chevronBackOutline} />
				</ion-button>
			</ion-buttons>
			<ion-title on:click={toggleDatePicker}>
				{new Date(
					new Date(day?.date).getTime() + new Date(day?.date).getTimezoneOffset() * 60000
				).toDateString()}
			</ion-title>
			<ion-buttons slot="end">
				<!-- {#if mode === 'view'} -->
				{#if $id !== 'new'}
					<ion-button on:click={do_delete_day}>
						<ion-icon slot="icon-only" icon={trashOutline} />
					</ion-button>
				{/if}
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		<!-- center this content -->
		<div class="centered">
			<ion-datetime id="datepicker" class="hidden" on:click={handleDate} />
		</div>

		<ion-grid>
			<ion-row>
				<ion-col style="text-align: left; font-weight: bold;">
					Total: {(day?.food_total || 0).toFixed(2)}
				</ion-col>
				<ion-col style="text-align: right; font-weight: bold;">
					{#if $currentUser?.user_metadata?.daily_budget}
						Left: {($currentUser?.user_metadata?.daily_budget - day?.food_total || 0).toFixed(2)}
					{/if}
				</ion-col>
			</ion-row>
		</ion-grid>
		<ion-list lines="full">
			<ion-reorder-group id="food_log_group" disabled="false" 
				on:ionItemReorder={
					(evt) => {
						evt.stopPropagation();
						evt.preventDefault();
						reorder_food_log(evt);
						evt.stopPropagation();
						evt.preventDefault();
					}
				}>
				{#each (day?.food_log?.entries || []) as entry, index}
					<ion-item
						on:click={() => {
							edit_food_log_entry(index)
						}}
					>
						<ion-reorder slot="start" />
						<div>
							{entry?.title}<br />
							<span class="description">{entry?.desc || ''}&nbsp;</span>
						</div>
						<ion-note slot="end" class="right">
							<div>
								{(entry?.amt || 0).toFixed(2)}<br />
								<span class="description">&nbsp;{entry?.cat || ''}</span>
							</div>
						</ion-note>
					</ion-item>
				{/each}
			</ion-reorder-group>

			<ion-item lines="none" on:click={add_food_log_entry}>
				<ion-icon icon={addCircleOutline} slot="start" />
				new food entry
			</ion-item>
		</ion-list>
		<!-- {#if mode === 'view' && day?.notes}<div class="ion-padding">{day?.notes}</div>{/if} -->
		<div class="ion-padding">
			<ion-input
				class="notes-box"
				value={day?.notes}
				on:ionChange={handler}
				on:ionBlur={saveOnBlur}
				required
				name="notes"
				type="text"
				placeholder="notes"
			/>
		</div>
	</ion-content>
	<ion-footer>
		<ion-grid>
			<ion-row>
				<ion-col>
					<div class="left">
						<div class="footertitle">Weight</div>
						<div class="footertitle">
							<ion-input
								on:ionChange={handleNumberValue}
								on:ionFocus={focusOnNumericInput}
								on:ionBlur={saveOnBlur}
								name="weight"
								class="weightBox"
								type="decimal"
								inputmode="decimal"
								value={day?.weight}
							/>
						</div>
					</div>
				</ion-col>
				<ion-col>
					<div class="right">
						<div class="footertitle">Water</div>
						<div class="footertitle together">
							<ion-icon
								color={day.water_total <= 0 ? 'medium' : 'dark'}
								icon={removeCircleOutline}
								size="large"
								on:click={downWater}
							/>
							<span class="water-digits">&nbsp;{day.water_total || 0}&nbsp;</span>
							<ion-icon icon={addCircleOutline} size="large" on:click={upWater} />
						</div>
					</div>
				</ion-col>
			</ion-row>
		</ion-grid>
		<br />
	</ion-footer>
</IonPage>

<style>
	.centered {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.hidden {
		display: none;
	}
	.water-digits {
		/* font-size: 2em; */
		/* font-weight: bold; */
		font-size: 2em;
		/* font-family: 'Courier New', Courier, monospace; */
	}
	.water-line {
		display: flex;
		flex-direction: row;
		justify-content: right;
		align-items: center;
	}
	ion-label {
		display: inline-block;
		width: 40%;
		text-align: right;
		padding-right: 10px;
	}
	ion-input {
		width: 60%;
		border: 1px solid;
		display: inline-block;
	}
	.notes-box {
		width: 100% !important;
		border: none;
	}
	.description {
		color: gray;
		font-size: 0.8em;
	}
	.right {
		text-align: right;
	}
	.weightBox {
		height: 50px;
		width: 100px;
		max-width: 100px;
		border: 1px solid rgb(212, 212, 212);
		background-color: var(--ion-background-color) !important;
		border-radius: 5px;
		text-align: center;
	}
	.footertitle {
		font-size: larger;
		text-align: center;
	}
	.left {
		text-align: left;
	}
	.right {
		text-align: right;
	}
	.together {
		page-break-inside: avoid;
	}
</style>
