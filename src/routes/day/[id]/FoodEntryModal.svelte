<script lang="ts">
    import { modalController } from "$ionic/svelte";
	import FoodSearchModal from './FoodSearchModal.svelte'
 
    import { toast } from '$services/toast';
    import { loadingBox } from "$services/loadingMessage";
    // read food data from json file
    export let entry: any = {};  
    export let isNew: boolean;
    import {
      mailOutline,
      closeOutline,
      fastFoodOutline,
      personAdd,
      lockOpenOutline,
      lockClosedOutline,
      arrowForwardOutline,
      trashOutline,
      checkmarkOutline,
      searchOutline,
      link
    } from "ionicons/icons";
  
    let showModal = false;
    const closeOverlay = () => {
      modalController.dismiss({ data: null });
    };

    function handleTextValue(event) {
        entry[event.target.name] = event.target.value!;
    }
    function handleSegmentValue(event) {
        entry[event.target.id] = event.target.value!;
    }

    function handleNumberValue(event) {
        try {
            entry[event.target.name] = parseFloat(event.target.value!) || 0;
        } catch (err) {
            console.error('handleNumberValue error', err)
            entry[event.target.name] = 0;
        }
        if (event.target.name === 'cps' || event.target.name === 'qty') {
            entry['amt'] = (entry['cps'] * entry['qty']);
        }
    }
	function focusOnNumericInput(event) {
		try {
			if ((parseFloat(event.target.value!) || 0) === 0) {
				event.target.value = ''
			}
		} catch (err) {
			console.error('error clearing zero value', err)
		}
	}

    function save() {
        modalController.dismiss({ data: entry });
    }
    function deleteEntry() {
        entry.deleted = true;
        modalController.dismiss({ data: entry });
    }
    async function search() {
        const result = await openFoodSearchBox();
    }

    const openFoodSearchBox = async () => {
		const openFoodSearchModalController = await modalController.create({
			component: FoodSearchModal,
			// componentProps: {
			// 	entry: entry,
			// },
			showBackdrop: true,
			backdropDismiss: true,
		})

		await openFoodSearchModalController.present()
		const { data } = await openFoodSearchModalController.onWillDismiss();
		if (data?.data !== null) {	
            entry.title = data.data.title || "";
            entry.cps = data.data.calories || 0;
            entry.qty = 1.0;
            entry.amt = entry.cps * entry.qty;
            entry.desc = data.data.portion || "";
			return true;
		} else {
			return false;
		}	
	}


  </script>
  
  <svelte:head>
    <title>FoodEntryModal</title>
  </svelte:head>
  <ion-header translucent="true">
    <ion-toolbar>
      <ion-title>Edit Entry</ion-title>
      <ion-buttons slot="start">
        <ion-icon 
        on:click={closeOverlay}
        icon={closeOutline} 
        slot="start" size="large" color="primary"></ion-icon>
      </ion-buttons>

      <ion-buttons slot="end">

        {#if !isNew}
        <ion-icon 
        on:click={deleteEntry}
        icon={trashOutline} 
        slot="start" size="large" color="primary"></ion-icon>
        {/if}

        <ion-icon 
        on:click={search}
        icon={searchOutline} 
        slot="start" size="large" color="primary"></ion-icon>

      </ion-buttons>

    </ion-toolbar>
  </ion-header>
  
  

<!-- day.food_log.entries.push({id: supabaseDataService.gen_random_uuid()})
day.food_log.entries[day.food_log.entries.length - 1].food_id = ''
day.food_log.entries[day.food_log.entries.length - 1].title = ''
day.food_log.entries[day.food_log.entries.length - 1].desc = ''
day.food_log.entries[day.food_log.entries.length - 1].cat = ''
day.food_log.entries[day.food_log.entries.length - 1].cps = 0 // cost per serving
day.food_log.entries[day.food_log.entries.length - 1].qty = 1 // servings
day.food_log.entries[day.food_log.entries.length - 1].amt = 0 -->

    <ion-grid class="ion-padding Grid">
        <ion-row>
            <ion-col>
                <ion-label>Title</ion-label>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                <ion-item class="formItem" lines="none">
                    <ion-input 
                        on:ionChange={handleTextValue}
                        name="title"
                        class="formInputBoxWithIcon"
                        type="text" 
                        value={entry.title}
                        placeholder="Title">
                        <ion-icon class="inputIcon" 
                          icon={fastFoodOutline} 
                          slot="start" size="large" color="medium"></ion-icon>
                    </ion-input>
                </ion-item>
            </ion-col>
        </ion-row>

        <ion-row>
            <ion-col>
                <ion-label>Cost Per Serving</ion-label>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                <ion-item class="formItem" lines="none">
                    <ion-grid>
                        <ion-row>
                            <ion-col style="text-align: center;"><ion-label>Per Serving</ion-label></ion-col>
                            <ion-col style="text-align: center;"><ion-label>Servings</ion-label></ion-col>
                            <ion-col style="text-align: center;"><ion-label>Total</ion-label></ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                <ion-input 
                                    on:ionChange={handleNumberValue}
                                    on:ionFocus={focusOnNumericInput}
                                    name="cps"
                                    class="formInputBoxCentered"
                                    inputmode="decimal"
                                    type="decimal" 
                                    value={entry.cps}>
                                </ion-input>        
                            </ion-col>
                            <ion-col>
                                <ion-input 
                                    on:ionChange={handleNumberValue}
                                    on:ionFocus={focusOnNumericInput}
                                    name="qty"
                                    class="formInputBoxCentered"
                                    inputmode="decimal"
                                    type="decimal" 
                                    value={entry.qty}>
                                </ion-input>        
                            </ion-col>
                            <ion-col>
                                <ion-input 
                                    on:ionChange={handleNumberValue}
                                    on:ionFocus={focusOnNumericInput}
                                    name="amt"
                                    class="formInputBoxCentered"
                                    inputmode="decimal"
                                    type="decimal" 
                                    value={entry.amt}>
                                </ion-input>        
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                </ion-item>

            </ion-col>
        </ion-row>

        <ion-row>
            <ion-col>
                <ion-label>Category</ion-label>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                <ion-item class="formItem" lines="none">

                    <ion-segment value={entry.cat}
                    on:ionChange={handleSegmentValue}
                    color="dark"
                    name="cat"
                    id="cat"
                    class="formSegment"
                    style="width: 100%;"
                    >
                        <!-- <ion-segment-button value="">
                          <ion-label>?</ion-label>
                        </ion-segment-button> -->
                        <ion-segment-button value="Breakfast">
                          <ion-label>Breakfast</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="Lunch">
                            <ion-label>Lunch</ion-label>
                          </ion-segment-button>
                          <ion-segment-button value="Dinner">
                            <ion-label>Dinner</ion-label>
                          </ion-segment-button>
                          <ion-segment-button value="Snack">
                            <ion-label>Snack</ion-label>
                          </ion-segment-button>
      
                    </ion-segment>


                </ion-item>
            </ion-col>
        </ion-row>


        <ion-row>
            <ion-col>
                <ion-label>Description</ion-label>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                <ion-item class="formItem" lines="none">
                    <ion-textarea 
                        on:ionChange={handleTextValue}
                        name="desc"
                        class="formTextarea"
                        type="text" 
                        value={entry.desc}
                        placeholder="Description">
                    </ion-textarea>
                </ion-item>
            </ion-col>
        </ion-row>

        <ion-row>
            <ion-col>
                <ion-button expand="block" 
                disabled={false}
                on:click={save}>
                <ion-icon icon={checkmarkOutline} size="large" />&nbsp;&nbsp;
                <b>Done</b></ion-button>                    
            </ion-col>
        </ion-row>
    </ion-grid>  
    <!-- <div class="ion-padding">{JSON.stringify(entry)}</div> -->

  <style>
  .Grid {
      max-width:375px;
  }
  input:-webkit-autofill {
      -webkit-text-fill-color: var(--ion-color-FORCEDARK);
      font-weight: 500px;
  }
  
  input:-webkit-autofill:focus {
      -webkit-text-fill-color: var(--ion-color-FORCEDARK);
      font-weight: 500px;
  } 
  
  
  .inputIcon {
      margin-left: 10px;
      margin-right: 10px
  }
  
  .formItem {
      --padding-start: 0px;
      --padding-end: 0px;
      --inner-padding-end: 0px;
  }
  .formItem3 {
      --padding-start: 0px;
      --padding-end: 0px;
      --inner-padding-end: 0px;
      width: 33%;
  }
  .formInputBoxWithIcon {
      height: 50px;
      border: 1px solid rgb(212, 212, 212);
      background-color: var(--ion-background-color) !important;
      border-radius: 5px;
  }
  .formInputBox {
      height: 50px;
      border: 1px solid rgb(212, 212, 212);
      background-color: var(--ion-background-color) !important;
      border-radius: 5px;
  }
  .formSegment {
    border: 1px solid rgb(212, 212, 212);
  }
  .formInputBoxCentered {
      height: 50px;
      border: 1px solid rgb(212, 212, 212);
      background-color: var(--ion-background-color) !important;
      border-radius: 5px;
      text-align: center;
  }
  .formTextarea {
      border: 1px solid rgb(212, 212, 212);
      background-color: var(--ion-background-color) !important;
      border-radius: 5px;
  }
  .toast {
      font-weight: bold;
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
  ion-segment {
    --background: var(--ion-color-primary);
  }
  </style>