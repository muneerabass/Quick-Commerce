/**
 * Tiny one-shot channel between AddressMapPickerScreen and AddressFormScreen.
 *
 * React Navigation discourages passing non-serializable callbacks through route
 * params, and the alternative (prop drilling / global context) is overkill for
 * a single "picker returns a value" interaction. The bus holds the latest pick
 * in memory; the form consumes it on focus, which clears it.
 */

export interface PickedLocation {
  latitude: number;
  longitude: number;
  address_line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

let pending: PickedLocation | null = null;

export const addressPickerBus = {
  set(location: PickedLocation): void {
    pending = location;
  },
  consume(): PickedLocation | null {
    const value = pending;
    pending = null;
    return value;
  },
};
