import { updateDynamics365FieldService } from './d365sync.js';
import { signOut } from './auth.js';

export const schedulerproConfig = {
    appendTo   : 'app',
    startDate  : new Date(2025, 9, 31, 8),
    endDate    : new Date(2025, 9, 31, 21),
    timeZone   : 'UTC',
    viewPreset : 'hourAndDay',
    columns    : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    features : {
        dependencies : false,
        eventEdit    : {
            items : {
                // Remove fields
                percentDoneField : null

            }
        }
    },
    // Add listener for data changes
    listeners : {
        dataChange : function(event) {
            updateDynamics365FieldService(event);
        }
    },tbar : {

        items : {

            deleteButton : {
                text  : 'Signout',
                icon  : 'b-fa b-fa-sign-out',
                style : 'margin-left: auto;',
                onClick() {
                    signOut().then(() => {
                        // Refresh the page after sign out
                        location.reload();
                    });
                }
            }
        }
    }
    // project : {

    //     resources : [
    //         { id : 1, name : 'Dan Stevenson' },
    //         { id : 2, name : 'Talisha Babin' }
    //     ],

    //     events : [
    //         { id : 1, startDate : '2025-12-01', duration : 3, durationUnit : 'd', name : 'Event 1' },
    //         { id : 2, duration : 4, durationUnit : 'd', name : 'Event 2' }
    //     ],

    //     assignments : [
    //         { event : 1, resource : 1 },
    //         { event : 2, resource : 2 }
    //     ],

    //     dependencies : [
    //         { fromEvent : 1, toEvent : 2 }
    //     ]
    // }
};