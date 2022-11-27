<script lang="ts">
	import LoginModal from './LoginModal.svelte'
  	import LoginNewPasswordModal from './LoginNewPasswordModal.svelte'
	import { modalController } from '$ionic/svelte'
	import { onMount } from 'svelte'
	import { currentUser } from '$services/supabase.auth.service'
	import { signOut } from './Login';
	import type { Provider } from '@supabase/supabase-js'
	export let profileFunction: Function = () => {}
	export let providers: Provider[] = []
	export let onSignIn: Function = () => {}
	export let onSignOut: Function = () => {}
	// export let profileTable: string = ''
	// export let profileKey: string = ''
	let token = ''

	onMount(() => {
	    checkHash();
	})

  const checkHash = () => {
		const hash = window.location.hash
		if (hash && hash.substring(0, 1) === '#') {
			const tokens = hash.substring(1).split('&')
			const entryPayload: any = {}
			tokens.map((token) => {
				const pair = (token + '=').split('=')
				entryPayload[pair[0]] = pair[1]
			})
			if (entryPayload?.type === 'recovery') {
				token = entryPayload.access_token
				setTimeout(() => {
					openPasswordResetBox()
				}, 2500)
			}
		}
 }
  const openProfile = async () => {
		if (profileFunction) {
			profileFunction()
		}
	}
	const doSignOut = async () => {		
		const { error } = await signOut()
		if (error) {
			console.error('Error signing out', error)
		} else {
			if (onSignOut) {
				onSignOut()
			} else {
				window.location.reload()
			}
		}
	}
	const openLoginBox = async () => {
		const openLoginModalController = await modalController.create({
			component: LoginModal,
			componentProps: {
				providers: providers,
				onSignIn: onSignIn,
			},
			showBackdrop: true,
			backdropDismiss: true,
		})

		await openLoginModalController.present()
	}
	const openPasswordResetBox = async () => {
		const openPasswordResetModalController = await modalController.create({
			component: LoginNewPasswordModal,
			componentProps: {
				token: token,
			},
			showBackdrop: true,
			backdropDismiss: true,
		})

		openPasswordResetModalController.onDidDismiss().then((value) => {
			if (value.role === 'backdrop') console.log('Backdrop clicked')
		})

		await openPasswordResetModalController.present()
	}
</script>

{#if $currentUser}
	<div class="fullWidth">
		<ion-button
			fill="outline"
			color="dark"
			on:click={openProfile}
			size="small"
			expand="block"
			strong
		>
			{$currentUser?.email}
		</ion-button>
		<ion-button fill="outline" color="dark" on:click={doSignOut} size="small" expand="block" strong>
			Sign Out
		</ion-button>
	</div>
{:else}
	<div class="fullWidth">
		<ion-button
			fill="outline"
			color="dark"
			on:click={openLoginBox}
			size="small"
			expand="block"
			strong
		>
			Sign In
		</ion-button>
	</div>
{/if}

<style>
	.fullWidth {
		width: 100%;
	}
</style>
