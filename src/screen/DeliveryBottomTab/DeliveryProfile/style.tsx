import { StyleSheet, Dimensions } from "react-native";
import { color } from "../../../constant";
import font from "../../../theme/font";

const { width, height } = Dimensions.get('window');

const YELLOW_DARK = "#FDB400";
const TEXT = "#1C1C1C";
const SUBTLE = "#9A9A9A";
const BORDER = "#EFEFEF";
const BG = "#FFFFFF";
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  container: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 22, color: TEXT, marginBottom: 12 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 11,
  },
  avatarWrap: { marginRight: 15 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarFallback: {
    backgroundColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontFamily: font.MonolithRegular, fontSize: 18, color: TEXT },
  statusDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: YELLOW_DARK,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BG,
  },
  name: { fontSize: 16, fontFamily: font.MonolithRegular, color: TEXT },
  email: { fontSize: 13, color: SUBTLE, marginTop: 5, fontFamily: font.MonolithRegular, },
  card: {
    backgroundColor: BG,
    marginTop: 5

  },
  row: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginHorizontal: 5
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  secureIconWrap: {
    backgroundColor: "#FFF1C2",
  },
  rowLabel: { marginLeft: 15, fontSize: 15, color: TEXT, },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: 54,
  },
  logoutBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFCC00",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    flexDirection: "row",
    gap: 8,
  },
  logoutText: { fontSize: 14, fontFamily: font.MonolithRegular, color: TEXT },

});
