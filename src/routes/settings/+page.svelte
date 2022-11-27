<script lang="ts">
	import IonPage from "$ionic/svelte/components/IonPage.svelte";
	import { checkmarkOutline } from 'ionicons/icons'
	import { goto } from '$app/navigation'
	import { currentUser } from '$services/supabase.auth.service';
	import { saveSettings } from './page';

	let days: any[]; // = cache || []
	let settings: any = {
		settings: {
			daily_budget: 0,
			target_weight: 0,
			water_target: 8,
		}
	};

	const ionViewDidEnter = () => {
		console.log('** ionViewDidEnter', $currentUser)
		settings = {
				daily_budget: 0,
				target_weight: 0,
				water_target: 8,
			}		
		if ($currentUser?.user_metadata?.daily_budget) 
			settings.daily_budget = $currentUser?.user_metadata?.daily_budget;
		if ($currentUser?.user_metadata?.target_weight) 
			settings.target_weight = $currentUser?.user_metadata?.target_weight;
		if ($currentUser?.user_metadata?.water_target)
			settings.water_target = $currentUser?.user_metadata?.water_target;
	};


	const gotoDay = (id: string) => {
		goto(`/day/[id]`,{id})
	}
	const save = async () => {
		console.log('save settings as', settings)
		const { data, error } = await saveSettings(settings);
		if (error) {
			console.log('save error', error)
		} else {
			console.log('save results', data, error)
		}
	}
	function focusOnNumericInput(event) {
        try {
            if ((parseFloat(event.target.value!) || 0) === 0) {
                event.target.value = '';
            }
        } catch (err) {
            console.error('error clearing zero value', err)
        }
        // put cursor at end of input
        event.target.getInputElement().then((input) => {
            console.log('input', input)
            // set cursor to end of input
            input.type = 'text';
            input.setSelectionRange(input.value.length, input.value.length);
            input.type = 'number';
        })
    }

</script>
<IonPage {ionViewDidEnter}>

<ion-header translucent="true">
	<ion-toolbar>
		<ion-buttons slot="start">
			<ion-menu-button />
		</ion-buttons>
		<ion-title>Settings</ion-title>
		<ion-buttons slot="end">
			<ion-button on:click={save}>
				<ion-icon slot="icon-only" icon={checkmarkOutline} />
			</ion-button>				
		</ion-buttons>
	</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
	<ion-list>
		<ion-item>
			<ion-label>Daily Budget</ion-label>
			<ion-input type="number" class="short"
				value={settings?.daily_budget} 
				on:ionFocus={focusOnNumericInput}
				on:ionChange={(e) => settings.daily_budget = e.detail.value}>
			</ion-input>
		</ion-item>
		<ion-item>
			<ion-label>Water Target</ion-label>
			<ion-input type="number" class="short"
				value={settings?.water_target} 
				on:ionFocus={focusOnNumericInput}
				on:ionChange={(e) => settings.water_target = e.detail.value}>
			</ion-input>
		</ion-item>
		<ion-item>
			<ion-label>Target Weight</ion-label>
			<ion-input type="number" class="short"
				value={settings?.target_weight} 
				on:ionFocus={focusOnNumericInput}
				on:ionChange={(e) => settings.target_weight = e.detail.value}>
			</ion-input>
		</ion-item>
		<!-- <ion-item>
			<ion-label position="stacked">Target Date</ion-label>
			<ion-datetime display-format="MMM DD, YYYY" value={settings?.target_date} on:ionChange={(e) => settings.target_date = e.detail.value}></ion-datetime>
		</ion-item> -->
	</ion-list>
</ion-content>
</IonPage>
<style>
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
	.short {
		width: 80px;
		max-width: 80px;
		text-align: right;
	}
	.description {
		color: gray;
		font-size: 0.8em;
	}
	.right {
		text-align: right;
	}

</style>
