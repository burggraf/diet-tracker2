<script lang="ts">
	import IonPage from '$ionic/svelte/components/IonPage.svelte'
	import { currentUser } from '$services/supabase.auth.service';
	import { Chart, registerables } from 'chart.js'
	import { getRPC } from './page';
	let chart_source = 'get_weights';
	let chart_label = 'Weight';
	let my_chart: any;
	// get the date one month ago
	let today = new Date();
	let one_month_ago = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() - 1);
	let start_date = one_month_ago.toISOString().split('T')[0];
	// get yesterday's date
	let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
	let end_date = yesterday.toISOString().split('T')[0];
	
	let dateChooserItem = 'start_date';
	const ionViewDidEnter = async () => {
		createChart(chart_source, start_date, end_date, chart_label)
		// createChart('get_calorie_totals', '2022-10-01', '2022-10-31', 'Calorie Totals')
	}
	const createChart = async (data_source: string, start_date: string, end_date: string, label: string) => {
		let chartData = [];
		let labels = [];
		let datapoints = [];
		const {data, error} = await getRPC(data_source,{start_date, end_date});
		if (error) {
			console.error('getRPC error', error);
		} else {
			if (data) {
				chartData = data;
				labels = chartData.map((item) => item.date);
				datapoints = chartData.map((item) => item.value);
			}
		}
		datapoints = massageData(data_source, datapoints);
		Chart.register(...registerables)
		const ctx: any = document.getElementById('myChart')

		const config: any = {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: label,
						backgroundColor: 'rgb(255, 99, 132)',
						borderColor: 'rgb(255, 99, 132)',
						data: datapoints,
					},
				],
			},
			options: {
				indexAxis: 'x',
				scales: {
					y: {
						beginAtZero: false,
					},
				},
				layout: {
					padding: {
						left: 10,
						right: 50
					},
				},
			},
		}
		if (my_chart) my_chart.destroy();
		my_chart = new Chart(ctx, config)

	}
	const massageData = (data_source, datapoints) => {
		// console.log('massageData', data_source, datapoints);
		let output = [];
		switch (data_source) {
			case 'get_weights':
				for (let i = 0; i < datapoints.length; i++) {
					if (i === 0) output.push(datapoints[i])
					else {
						if (datapoints[i] === 0) {
							output.push(output[i - 1])
						} else {
							output.push(datapoints[i])
						}
					}
				}
				break;
			default:
				output = [...datapoints];
		}
		// console.log('output', output);
		return output;
	}
	function handleSegmentChange(e) {
		chart_source = e.detail.value
		switch (chart_source) {
			case 'get_weights':
				chart_label = 'Weight';
				break
			case 'get_calorie_totals':
				chart_label = 'Calorie Totals';
				break
		}
		createChart(chart_source, start_date, end_date, chart_label)
	}
	const handleDate = async (event) => {
		console.log('handleDate', event.target.value);
		if (!event.target.value) return;
		const theDate = new Date(event.target.value);
		switch (dateChooserItem) {
			case 'start_date':
				start_date = theDate.toISOString().slice(0, 10);
				break;
			case 'end_date':
				end_date = theDate.toISOString().slice(0, 10);
				break;
		}
		// add hidden class from dateChooser
		const dateChooser = document.getElementById('datepicker');
		if (dateChooser) {
			dateChooser.classList.add('hidden');
			unHighlightDateButtons();
			createChart(chart_source, start_date, end_date, chart_label)
		}
	}
	const chooseDate = async (event) => {
		console.log('chooseDate', event.target);
		event.target.color = 'medium';
		const dateChooser = document.getElementById('datepicker');
		// check if dateChooser has hidden class
		// console.log('value', dateChooser.classList.toString().indexOf('hidden'));
		if (dateChooser && dateChooser.classList.toString().indexOf('hidden') === -1) {
			console.log('IT IS ALREADY HIDDEN')
			dateChooser.classList.add('hidden');
			unHighlightDateButtons();
			// add hidden class from dateChooser
		} else {
			console.log('HIDE IT');
			if (dateChooser) {
				dateChooser.classList.remove('hidden');
			}

		}
		console.log('chooseDate event.target.id', event.target.id);
		dateChooserItem = event.target.id;
		// remove hidden class from dateChooser
		console.log('dateChooser', dateChooser);
	}
	const unHighlightDateButtons = () => {
		(document.getElementById('start_date') as any).color = 'light';
		(document.getElementById('end_date') as any).color = 'light';
	}
</script>

<ion-header translucent="true">
	<ion-toolbar>
		<ion-buttons slot="start">
			<ion-menu-button />
		</ion-buttons>
		<ion-title>Diet Tracker Charts</ion-title>
		<!-- <ion-buttons slot="end">
			<ion-button on:click={() => gotoWidget('new')}>
				<ion-icon slot="icon-only" icon={addOutline} />
			</ion-button>				
		</ion-buttons> -->
	</ion-toolbar>
</ion-header>

<IonPage {ionViewDidEnter}>
	<ion-content class="ion-padding">
		<div class="grid500 center">
			&nbsp;
		</div>
		{#if $currentUser}
			<div class="segment">
				<ion-segment value={chart_source} on:ionChange={handleSegmentChange}>
					<ion-segment-button value="get_weights">
						<ion-label>Weight</ion-label>
					</ion-segment-button>
					<ion-segment-button value="get_calorie_totals">
						<ion-label>Calorie Totals</ion-label>
					</ion-segment-button>
				</ion-segment>
			</div>
			<div class="centered">
				<ion-button id="start_date" size="small" color="light" on:click={chooseDate}>{start_date}</ion-button>
				&nbsp;&nbsp;to&nbsp;&nbsp;
				<ion-button id="end_date" size="small" color="light" on:click={chooseDate}>{end_date}</ion-button>
			</div>
			<div class="centered">
				<ion-datetime id="datepicker" class="hidden" on:click={handleDate}></ion-datetime>
			</div>	
			<canvas id="myChart" width="400" height="400" />	
		{:else}
			<div class="grid500 center">not logged in</div>
		{/if}

		<!-- currentUser: {JSON.stringify($currentUser)} -->
	</ion-content>
</IonPage>

<style>
	.center {
		margin: auto;
		width: 50%;
		/* border: 3px solid green; */
		padding: 10px;
	}
	.grid500 {
		max-width: 500px;
	}
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
