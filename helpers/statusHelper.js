export const STATUS_SYNCED = "Synced";
export const STATUS_SYNCING = "Syncing";

export const STATUS_GENERATED = "Generated"; 
export const STATUS_GENERATING = "Generating"; 

export const STATUS_ACTIVE = "Active"; 
export const STATUS_INACTIVE = "Inactive";

export function isReady(status) {
  if ((status == STATUS_SYNCED)) {
    return true;
  }

  if ((status == STATUS_SYNCING)) {
    return false;
  }

  if ((status == STATUS_GENERATED)) {
    return true;
  }

  if ((status == STATUS_GENERATING)) {
    return false;
  }

  return false;
}
