<script lang="ts">
	import Login from '$components/Login/Login.svelte'
	import { currentUser } from '$services/user.store';
</script>

<ion-header translucent="true">
	<ion-toolbar>
		<ion-buttons slot="start">
			<ion-menu-button />
		</ion-buttons>
		<ion-title>About Diet Tracker</ion-title>
		<!-- <ion-buttons slot="end">
			<ion-button on:click={() => gotoWidget('new')}>
				<ion-icon slot="icon-only" icon={addOutline} />
			</ion-button>				
		</ion-buttons> -->
	</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
    <div class="grid500 center">
        About Diet Tracker... <br /><br />
    </div>
	{#if $currentUser}
    <div class="grid500 center">
        logged in
    </div>
	{:else}
        <div class="grid375 center">
		<Login
			providers={['google', 'facebook', 'twitter']}
			onSignOut={() => {
                localStorage.clear();
				window.location.href = '/'
			}}
			profileFunction={() => {
				//console.log('do some profileFunction here')
			}}
		/>
        </div>
	{/if}
    <!-- currentUser: {JSON.stringify($currentUser)} -->
</ion-content>

<style>
.center {
  margin: auto;
  width: 50%;
  /* border: 3px solid green; */
  padding: 10px;
}
.grid500 {
    max-width:500px;
}

.grid375 {
    max-width:375px;
}

</style>
