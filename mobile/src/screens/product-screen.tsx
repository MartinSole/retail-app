import { Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { StatusBanners } from "../components/status-banners";
import type { RootStackParamList } from "../navigation";
import { useRetail } from "../retail-context";
import { styles } from "../styles";
import { formatMoney } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export function ProductScreen({ navigation, route }: Props) {
  const { products, addToCart, notice, error } = useRetail();
  const product = products.find((item) => item.id === route.params.productId);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <StatusBanners notice={notice} error={error} />

      <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryButtonText}>Back to Catalogue</Text>
      </Pressable>

      {!product ? (
        <Text style={styles.productMeta}>Product not found.</Text>
      ) : (
        <View style={styles.productCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Text style={styles.productMeta}>Price: {formatMoney(product.priceCents)}</Text>
          <Text style={styles.productMeta}>Available stock: {product.availableStock}</Text>
          <Text style={styles.productMeta}>Reserved: {product.reserved}</Text>

          <Pressable style={styles.primaryButton} onPress={() => void addToCart(product.id)}>
            <Text style={styles.primaryButtonText}>Add to Cart</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Cart")}>
            <Text style={styles.secondaryButtonText}>Go to Cart</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
