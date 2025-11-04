import { ResourceModel } from '@bryntum/schedulerpro';

// Custom resource model for D365 Field Service bookable resources
export default class CustomResourceModel extends ResourceModel {
    static $name = 'CustomResourceModel';

    static fields = [
        // Map D365 bookableresourceid to Bryntum id
        { name : 'id', dataSource : 'bookableresourceid' },
        // Store original D365 resource id
        { name : 'bookableresourceid', type : 'string' },
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
