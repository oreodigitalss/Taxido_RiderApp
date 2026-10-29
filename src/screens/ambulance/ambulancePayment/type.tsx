export interface AmbulancePaymentProps {
    label?: string,
    method?: string | number | any,
    selectedPaymentMethod?: any,
    onPress: (method: any) => void
}