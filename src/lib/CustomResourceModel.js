import { ResourceModel } from '@bryntum/schedulerpro';

// Custom resource model for D365 Field Service bookable resources
export default class CustomResourceModel extends ResourceModel {
    static $name = 'CustomResourceModel';
    static fields = [
        { name : 'bookableresourceid', type : 'string' },
        { name : 'etag', type : 'string' }
    ];
}
