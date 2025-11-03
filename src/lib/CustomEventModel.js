import { EventModel } from '@bryntum/schedulerpro';

// Custom event model for D365 Field Service bookings
export default class CustomEventModel extends EventModel {
    static $name = 'CustomEventModel';
    static fields = [
        { name : 'bookableresourcebookingid', type : 'string' },
        { name : 'etag', type : 'string' }
    ];
}
