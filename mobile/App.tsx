import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./src/navigation";
import { RetailProvider, useRetail } from "./src/retail-context";
import { styles } from "./src/styles";
import { CartScreen } from "./src/screens/cart-screen";
import { CatalogueScreen } from "./src/screens/catalogue-screen";
import { CheckoutScreen } from "./src/screens/checkout-screen";
import { ProductScreen } from "./src/screens/product-screen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { loading } = useRetail();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Loading Gibson catalogue...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Catalogue"
          screenOptions={{
            headerStyle: { backgroundColor: "#fff7ec" },
            headerTintColor: "#111827",
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#f3ede4" },
          }}
        >
          <Stack.Screen
            name="Catalogue"
            component={CatalogueScreen}
            options={{ title: "Gibson Catalogue" }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductScreen}
            options={{ title: "Product Details" }}
          />
          <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Your Cart" }} />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ title: "Checkout" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <RetailProvider>
      <RootNavigator />
    </RetailProvider>
  );
}
