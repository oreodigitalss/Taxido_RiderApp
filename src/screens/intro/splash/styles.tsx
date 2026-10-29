import { Dimensions, StyleSheet } from 'react-native';
const { height } = Dimensions.get("window");


const styles = StyleSheet.create({
  img: {
    width: "80%",
    height: height * 0.12,
    resizeMode: "contain",
  },
});
export { styles };
