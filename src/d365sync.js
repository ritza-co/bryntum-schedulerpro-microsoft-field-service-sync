import {
    updateWorkOrder,
    updateBooking,
    createBooking,
    deleteBooking
} from './d365api.js';

/**
 * Handles data changes from Bryntum Scheduler Pro and syncs them to D365 Field Service
 * @param {Object} event - The dataChange event from Bryntum Scheduler Pro
 */
export async function updateDynamics365FieldService(event) {
    const { action, record, changes } = event;
    const { store } = event.source;

    console.log('Data change detected:', { action, store: store.id, record });

    try {
        // Handle different store types
        switch (store.id) {
            case 'events':
                await handleEventChanges(action, record, changes);
                break;

            case 'assignments':
                await handleAssignmentChanges(action, record, changes);
                break;

            case 'resources':
                // Resources are typically managed in D365, so we might not sync these
                console.log('Resource changes are not synced to D365');
                break;

            case 'dependencies':
                // Dependencies might be handled differently in D365
                console.log('Dependency changes are not synced to D365');
                break;

            default:
                console.log(`Unhandled store: ${store.id}`);
        }
    } catch (error) {
        console.error('Error syncing to D365:', error);
        // Optionally show a notification to the user
        throw error;
    }
}

/**
 * Handle changes to events (work orders)
 */
async function handleEventChanges(action, record, changes) {
    switch (action) {
        case 'update':
            // Map Bryntum event fields to D365 work order fields
            const workOrderUpdates = {};

            if (changes.name) {
                workOrderUpdates.msdyn_name = changes.name.value;
            }

            if (changes.startDate) {
                workOrderUpdates.msdyn_datewindowstart = changes.startDate.value.toISOString();
            }

            if (changes.endDate) {
                workOrderUpdates.msdyn_datewindowend = changes.endDate.value.toISOString();
            }

            if (changes.duration) {
                workOrderUpdates.msdyn_duration = changes.duration.value;
            }

            // Only update if there are actual changes
            if (Object.keys(workOrderUpdates).length > 0) {
                await updateWorkOrder(record.d365Id, workOrderUpdates);
                console.log('Work order updated in D365:', record.d365Id);
            }
            break;

        case 'add':
            console.log('Creating new work orders in D365 is not implemented yet');
            // Typically work orders are created in D365, not from the scheduler
            break;

        case 'remove':
            console.log('Deleting work orders from D365 is not implemented yet');
            // Typically work orders are managed in D365
            break;
    }
}

/**
 * Handle changes to assignments (bookings)
 */
async function handleAssignmentChanges(action, record, changes) {
    switch (action) {
        case 'add':
            // Create a new booking in D365
            const bookingData = {
                'msdyn_workorder@odata.bind': `/msdyn_workorders(${record.event.d365Id})`,
                'resource@odata.bind': `/bookableresources(${record.resource.d365Id})`,
                starttime: record.event.startDate.toISOString(),
                endtime: record.event.endDate.toISOString(),
                duration: record.event.duration
            };

            const newBooking = await createBooking(bookingData);
            // Store the D365 booking ID on the assignment record
            record.d365Id = newBooking.bookableresourcebookingid;
            console.log('Booking created in D365:', newBooking.bookableresourcebookingid);
            break;

        case 'update':
            // Update an existing booking
            const bookingUpdates = {};

            if (changes.startDate || record.event?.startDate) {
                bookingUpdates.starttime = (changes.startDate?.value || record.event.startDate).toISOString();
            }

            if (changes.endDate || record.event?.endDate) {
                bookingUpdates.endtime = (changes.endDate?.value || record.event.endDate).toISOString();
            }

            if (changes.duration || record.event?.duration) {
                bookingUpdates.duration = changes.duration?.value || record.event.duration;
            }

            // Handle resource reassignment
            if (changes.resource) {
                bookingUpdates['resource@odata.bind'] = `/bookableresources(${changes.resource.value.d365Id})`;
            }

            if (Object.keys(bookingUpdates).length > 0 && record.d365Id) {
                await updateBooking(record.d365Id, bookingUpdates);
                console.log('Booking updated in D365:', record.d365Id);
            }
            break;

        case 'remove':
            // Delete a booking from D365
            if (record.d365Id) {
                await deleteBooking(record.d365Id);
                console.log('Booking deleted from D365:', record.d365Id);
            }
            break;
    }
}
