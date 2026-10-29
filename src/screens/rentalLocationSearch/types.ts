export interface PickUpDetailProps {
  bgColor?: string;
  activeField?: string | null;
  pickupLocation?: string;
  setPickupLocation?: (value: string) => void;
  setActiveField?: (value: string) => void;
}
