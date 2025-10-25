// components/styles.js
import { StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Fonts } from "./theme";


export function useAppStyles() {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      background: "#F2F0EF",
      text: "#121212",
      textSecondary: "#666666",
      secondary: "#C9C8C7",
      primary: "#FFDE59",
      accent: "#4B7BEC",
      success: "#2ECC71",
      cardBackground: "#FFFFFF",
      inputBackground: "#E8E8E8",
      inputText: "#121212",
      placeholderText: "#999999",
      modalBackground: "#121212",
      modalContent: "#F2F0EF",
    },
    dark: {
      background: "#1F1B24",
      text: "#CFD8D7",
      textSecondary: "#999999",
      secondary: "#332940",
      primary: "#1A083E",
      accent: "#5B8BFC",
      success: "#3EDC81",
      cardBackground: "#2A2633",
      inputBackground: "#3A3644",
      inputText: "#CFD8D7",
      placeholderText: "#666666",
      modalBackground: "rgba(255,255,255,0.1)",
      modalContent: "#333333",
    },
  };

  const theme = colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      backgroundColor: theme.background,
      color: theme.secondary,
      gap: 20,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      fontFamily: Fonts.mono,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "normal",
      color: theme.text,
      fontFamily: Fonts.mono,
    },
    paragraph: {
      fontSize: 16,
      fontWeight: "300",
      color: theme.text,
      fontFamily: Fonts.sans,
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
      backgroundColor: theme.cardBackground,
      padding: 16,
      borderRadius: 12,
      width: "100%",
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    exerciseCard: {
      backgroundColor: theme.secondary,
      padding: 12,
      borderRadius: 8,
      width: "100%",
      marginTop: 8,
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
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    input: {
      backgroundColor: theme.inputBackground,
      color: theme.inputText,
      borderRadius: 20,
      padding: 12,
      fontSize: 16,
      fontFamily: Fonts.sans,
    },
    messageBubbleBot: {
      alignSelf: "flex-start",
      backgroundColor: theme.cardBackground,
      padding: 12,
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      maxWidth: "75%",
      marginVertical: 4,
    },
    messageBubbleUser: {
      alignSelf: "flex-end",
      backgroundColor: theme.accent,
      padding: 12,
      borderRadius: 16,
      borderBottomRightRadius: 4,
      maxWidth: "75%",
      marginVertical: 4,
    },
    messageBubbleUserText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontFamily: Fonts.sans,
    },
    sendButton: {
      backgroundColor: theme.accent,
      padding: 12,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      width: 44,
      height: 44,
    },
    largeNumber: {
      fontSize: 56,
      fontWeight: "bold",
      color: theme.success,
      fontFamily: Fonts.mono,
    },
    statCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    chartPlaceholder: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 24,
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
  });

  return styles;
}
