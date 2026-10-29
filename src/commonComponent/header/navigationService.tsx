import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@src/navigation/types';
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export function navigate<T extends keyof RootStackParamList>(name: T, params?: RootStackParamList[T]) {
  if (navigationRef.isReady()) navigationRef.dispatch({ type: 'NAVIGATE', payload: { name, params } });
}
