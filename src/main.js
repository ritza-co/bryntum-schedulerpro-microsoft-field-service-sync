import { SchedulerPro } from '@bryntum/schedulerpro';
import './style.css';
import { schedulerproConfig } from './schedulerproConfig';
import { signIn } from './auth.js';
import { getResources, getBookings } from './d365api.js';
import CustomEventModel from './lib/CustomEventModel.js';
import CustomResourceModel from './lib/CustomResourceModel.js';

const signInLink = document.getElementById('signin');
const loaderContainer = document.querySelector('.loader-container');

async function displayUI() {
    const account = sessionStorage.getItem('msalAccount');
    if (!account) {
        await signIn();
    }
    const content = document.getElementById('content');
    content.style = 'display: block';

    // Display Scheduler Pro after sign in
    const [resourcesData, bookingsData] = await Promise.all([
        getResources(),
        getBookings()
    ]);

    console.log('Resources:', resourcesData);
    console.log('Bookings:', bookingsData);

    // Map D365 resources to Bryntum resources
    const schedulerResources = [];
    resourcesData.value.forEach((resource) => {
        schedulerResources.push({
            id                 : resource.bookableresourceid,
            name               : resource.name,
            bookableresourceid : resource.bookableresourceid,
            etag               : resource['@odata.etag']?.replace(/\\"/g, '"')
        });
    });

    // Map D365 bookings to Bryntum events
    const schedulerEvents = [];
    bookingsData.value.forEach((booking) => {
        schedulerEvents.push({
            id                        : booking.bookableresourcebookingid,
            name                      : booking.name || 'Untitled Booking',
            startDate                 : new Date(booking.starttime),
            endDate                   : new Date(booking.endtime),
            duration                  : booking.duration,
            durationUnit              : 'minute',
            resourceId                : booking.Resource?.bookableresourceid,
            bookableresourcebookingid : booking.bookableresourcebookingid,
            etag                      : booking['@odata.etag']?.replace(/\\"/g, '"')
        });
    });

    // Initialize Scheduler Pro with D365 data
    new SchedulerPro({
        ...schedulerproConfig,
        project : {
            eventStore : {
                modelClass : CustomEventModel
            },
            resourceStore : {
                modelClass : CustomResourceModel
            },
            resources : schedulerResources,
            events    : schedulerEvents
        }
    });
}


if (sessionStorage.getItem('msalAccount')) {
    displayUI();
    signInLink.style = 'display: none';
}
else {
    signInLink.style = 'display: block';
}

loaderContainer.style = 'display: none';

signInLink.addEventListener('click', displayUI);
