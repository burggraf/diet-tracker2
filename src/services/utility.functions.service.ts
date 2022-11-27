//import * as moment from 'moment';

  

    export const gen_random_uuid = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
    export const uuid_generate_v4 = gen_random_uuid;
  
    // public getToday = () => {
    //   const date = new Date();
    //   return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
    //                   .toISOString()
    //                   .split("T")[0];
    // }
    export const getToday = () => {
      const date = new Date();
      return new Date(date.getTime())
                      .toISOString()
                      .split("T")[0];
    }

    // public formatDate(date: string) {
  //   if (!date) { return ''; }
  //   if (date.indexOf('T') > -1) {
  //     // date time
  //     // Remove 'Z' so the function doesn't think the dates are GMT
  //     return moment.default(date.replace('Z', '')).format('L') + ' ' + moment.default(date.replace('Z', '')).format('LT');
  //   } else {
  //     return moment.default(date).format('L');
  //   }
  // }



