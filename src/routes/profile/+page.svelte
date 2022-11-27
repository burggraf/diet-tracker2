<script lang="ts">
	import IonPage from '$ionpage';
	import { saveProfile } from './profile';
	import { currentUser, currentProfile } from '$services/supabase.auth.service';
	let changed = false;
	const save = async (e?: any) => {
		if (e) {
			if ($currentProfile[e.target.name] !== e.target.value) changed = true;
			$currentProfile[e.target.name] = e.target.value;
		}
		if (!$currentProfile.userid) {
			$currentProfile.userid = $currentUser.id;
		}
		if (changed) {
			const { data, error } = await saveProfile($currentProfile);
			if (!error) {
				changed = false;
			}
		}
	}
</script>
<IonPage>
<ion-header>
	<ion-toolbar translucent="true">
		<ion-buttons slot="start">
			<ion-menu-button />
		</ion-buttons>
		<ion-title>Profile</ion-title>
	</ion-toolbar>
</ion-header>
<ion-content class="ion-padding">
	<div class="flex-container">
		<ion-list class="input-box">
			<ion-item lines="none">
				<ion-label position="stacked">Name</ion-label>
				<ion-input 
					name="name"
					debounce={500} 
					on:ionChange={save}
					type="text" 
					value={$currentProfile?.name}></ion-input>
			</ion-item>
			<ion-item lines="none">
				<ion-label position="stacked">Bio</ion-label>
				<ion-input 
					name="bio"
					debounce={500} 
					on:ionChange={save}
					type="text" 
					value={$currentProfile?.bio}></ion-input>
			</ion-item>
		</ion-list>	
	</div>
</ion-content>
</IonPage>
<style>
	ion-label {
		font-weight: bold;
	}
	.input-box {
		max-width: 400px; 
		width: 400px;
		border: 1pt solid;
	}
	.flex-container {
		display: flex;
		display: -webkit-flex;
		display: -moz-flex;
		flex-flow: row wrap;
		-webkit-flex-flow: row wrap;
		-moz-flex-flow: row wrap;
		justify-content: center;
	}

</style>
