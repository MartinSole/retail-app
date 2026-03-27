import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { StatusBanners } from "../components/status-banners";
import type { RootStackParamList } from "../navigation";
import { useRetail } from "../retail-context";
import { styles } from "../styles";
import { formatMoney, formatTimestamp, subtotalFromLines } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export function CartScreen({ navigation }: Props) {
  const { cart, notice, error, updateQuantity, removeItem } = useRetail();
  const subtotal = subtotalFromLines(cart?.lines ?? []);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <StatusBanners notice={notice} error={error} />

      <Text style={styles.screenTitle}>Cart</Text>
      <Text style={styles.productMeta}>
        Reservation expires: {cart ? formatTimestamp(cart.expiresAt) : "N/A"}
      </Text>

      {!cart || cart.lines.length === 0 ? (
        <Text style={styles.productMeta}>Your cart is empty.</Text>
      ) : (
        <>
          {cart.lines.map((line) => (
            <View key={line.productId} style={styles.cartLine}>
              <View style={styles.cartLineHeader}>
                <Text style={styles.productName}>{line.name}</Text>
                <Text style={styles.productMeta}>{formatMoney(line.lineTotalCents)}</Text>
              </View>
              <Text style={styles.productMeta}>Unit: {formatMoney(line.unitPriceCents)}</Text>

              <View style={styles.quantityRow}>
                <Text style={styles.productMeta}>Qty</Text>
                <TextInput
                  style={styles.quantityInput}
                  defaultValue={String(line.quantity)}
                  keyboardType="numeric"
                  onSubmitEditing={(event) => {
                    const value = Number(event.nativeEvent.text);
                    if (Number.isInteger(value) && value >= 0) {
                      void updateQuantity(line.productId, value);
                    }
                  }}
                />
                <Pressable style={styles.ghostButton} onPress={() => void removeItem(line.productId)}>
                  <Text style={styles.ghostButtonText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Text style={styles.sectionTotal}>Subtotal: {formatMoney(subtotal)}</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Checkout")}>
            <Text style={styles.primaryButtonText}>Continue to Checkout</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
