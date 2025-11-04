import { EventModel } from '@bryntum/schedulerpro';

// Custom event model for D365 Field Service bookings
export default class CustomEventModel extends EventModel {
    static $name = 'CustomEventModel';

    static fields = [
        // Map D365 bookableresourcebookingid to Bryntum id
        { name : 'id', dataSource : 'bookableresourcebookingid' },
        // Store original D365 booking id
        { name : 'bookableresourcebookingid', type : 'string' },
        // Map D365 date/time fields - start when travel begins (estimated arrival time)
        { name : 'startDate', dataSource : 'msdyn_estimatedarrivaltime', type : 'date' },
        { name : 'endDate', dataSource : 'endtime', type : 'date' },
        // Set duration unit to minutes (D365 uses minutes)
        { name : 'durationUnit', defaultValue : 'minute' },
        // Convert travel duration to preamble string format (e.g., "62 minutes")
        {
            name    : 'preamble',
            type    : 'string',
            convert : (_value, data) => {
                const duration = data.msdyn_estimatedtravelduration;
                return duration ? `${duration} minutes` : null;
            }
        },
        // Map nested resource reference
        { name : 'resourceId', dataSource : 'Resource.bookableresourceid' },
        // Sanitize and store ETag
        {
            name    : 'etag',
            type    : 'string',
            convert : (_value, data) => {
                const raw = data['@odata.etag'];
                return raw ? raw.replace(/\\"/g, '"') : null;
            }
        }
    ];
}
