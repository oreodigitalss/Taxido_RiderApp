declare module 'react-native-progress-bar-animated' {
  import type { ComponentType } from 'react';
  const ProgressBar: ComponentType<{ width: number; value?: number; backgroundColorOnComplete?: string; backgroundColor?: string; borderColor?: string; height?: number; borderRadius?: number }>;
  export default ProgressBar;
}
