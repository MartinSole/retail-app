import { Pressable, ScrollView, Text, View } from "react-native";

import { StatusBanners } from "../components/status-banners";
import { useRetail } from "../retail-context";
import { styles } from "../styles";
import { formatMoney, formatTimestamp } from "../utils";

export function CheckoutScreen() {
  const { checkout, checkingOut, checkoutResult, stockIssues, notice, error } = useRetail();

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <StatusBanners notice={notice} error={error} />

      <Text style={styles.screenTitle}>Checkout</Text>

      {checkoutResult ? (
        <View style={styles.checkoutCard}>
          <Text style={styles.successTitle}>Order Confirmed</Text>
          <Text style={styles.productMeta}>Order ID: {checkoutResult.orderId}</Text>
          <Text style={styles.productMeta}>Purchased: {formatTimestamp(checkoutResult.purchasedAt)}</Text>
          <Text style={styles.sectionTotal}>Total: {formatMoney(checkoutResult.totalCents)}</Text>
        </View>
      ) : null}

      {stockIssues.length > 0 ? (
        <View style={styles.checkoutCard}>
          <Text style={styles.errorTitle}>Stock issues</Text>
          {stockIssues.map((issue) => (
            <Text key={issue.productId} style={styles.productMeta}>
              {issue.productId}: requested {issue.requested}, available {issue.available}
            </Text>
          ))}
        </View>
      ) : null}

      <Pressable
        style={[styles.primaryButton, checkingOut && styles.disabledButton]}
        disabled={checkingOut}
        onPress={() => void checkout()}
      >
        <Text style={styles.primaryButtonText}>{checkingOut ? "Processing..." : "Confirm Checkout"}</Text>
      </Pressable>
    </ScrollView>
  );
}
