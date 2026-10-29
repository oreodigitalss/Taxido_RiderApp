import { StyleSheet } from "react-native";
import { fontSizes, windowHeight } from "@src/themes";

const styles = StyleSheet.create({
    tabBar: {
        height: windowHeight(57),
        paddingBottom: windowHeight(11),
        paddingTop: windowHeight(10),
        borderTopWidth: windowHeight(1),
        overflow: 'visible'
    },
    text: {
        fontSize: 11
    },
    flex: {
        flex: 1
    }

})
export default styles;