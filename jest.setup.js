import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));


jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
    const turboModuleRegistry = jest.requireActual("react-native/Libraries/TurboModule/TurboModuleRegistry");
    return {
      ...turboModuleRegistry,
      getEnforcing: name => {
        if (name === "RNDocumentPicker") {
          return null;
        }
        return turboModuleRegistry.getEnforcing(name);
      }
    };
  });
