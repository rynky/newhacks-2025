// components/styles.js
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet } from "react-native";


export function useAppStyles() {
  const colorScheme = useColorScheme(); // 'light' or 'dark'

  const colors = {
    light: {
      background: "#ffffffff",
      text: "#000",
      secondary: "#f1f1f1ff",
      modalBackground: "rgba(0,0,0,0.5)",
      modalContent: "#fff",
    },
    dark: {
      background: "#1F1b24ff",
      text: "#cfd8d7ff",
      secondary: "#332940ff", 
      primary: "#1a083eff",
      modalBackground: "rgba(255,255,255,0.1)",
      modalContent: "#333",
    },
  };

  const theme = colorScheme === "dark" ? colors.dark : colors.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      backgroundColor: theme.background,
      gap: 20,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "normal",
      color: theme.text,
    },
    paragraph: {
      fontSize: 16,
      fontWeight: "300",
      color: theme.text,
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: "80%",
      backgroundColor: theme.text,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.modalBackground,
    },
    modalContent: {
      width: 300,
      padding: 20,
      backgroundColor: theme.modalContent,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonStyle: {
      backgroundColor: theme.secondary,
      padding: 10,
      borderRadius: 10,
    },
    rowContainer: {
      flexDirection: "row",
      width: "100%",
      gap: 10,
      backgroundColor: theme.background,
    },
    flexButton: {
      flex: 1,            
      alignItems: "center",  
      justifyContent: "center", 
    },
    routineCard: {
      backgroundColor: theme.secondary,
      padding: 15,
      borderRadius: 10,
      width: "100%",
      marginTop: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
  });

  return styles;
}
