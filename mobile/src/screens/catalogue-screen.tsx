import { ScrollView, Text, View, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { StatusBanners } from "../components/status-banners";
import type { RootStackParamList } from "../navigation";
import { useRetail } from "../retail-context";
import { styles } from "../styles";
import { formatMoney } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "Catalogue">;

export function CatalogueScreen({ navigation }: Props) {
  const { products, discounts, addToCart, notice, error } = useRetail();

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <StatusBanners notice={notice} error={error} />

      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.secondaryButtonText}>Go to Cart</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.secondaryButtonText}>Go to Checkout</Text>
        </Pressable>
      </View>

      <Text style={styles.screenTitle}>Active Promotions</Text>
      {discounts.map((discount) => (
        <View key={discount.id} style={styles.discountCard}>
          <Text style={styles.discountName}>{discount.name}</Text>
          <Text style={styles.discountDescription}>{discount.description}</Text>
        </View>
      ))}

      <Text style={styles.screenTitle}>Products</Text>
      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Text style={styles.productMeta}>Price: {formatMoney(product.priceCents)}</Text>
          <Text style={styles.productMeta}>Available stock: {product.availableStock}</Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={() => void addToCart(product.id)}>
              <Text style={styles.primaryButtonText}>Add to Cart</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
            >
              <Text style={styles.secondaryButtonText}>Details</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
