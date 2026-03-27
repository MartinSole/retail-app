import { Text } from "react-native";

import { styles } from "../styles";

type StatusBannersProps = {
  notice: string | null;
  error: string | null;
};

export function StatusBanners({ notice, error }: StatusBannersProps) {
  return (
    <>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
}
