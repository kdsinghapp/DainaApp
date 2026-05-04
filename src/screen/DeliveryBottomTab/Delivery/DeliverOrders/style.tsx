import { StyleSheet, Dimensions } from "react-native";
import font from "../../../../theme/font";



export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },

  /* header */
  ordersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "700",
  },

  /* summary cards */
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  summaryTitle: {
    color: "#EDEDED",
    fontSize: 14,
    marginTop: 8,
    fontFamily: font.MonolithRegular,
  },
  summaryValue: {
    marginTop: 5,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: font.MonolithRegular,
  },

  /* tabs */
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: "center",
    marginTop: 12
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#FFCC00",
    height: 40,
  },
  tabText: {
    fontSize: 13,
    color: "#1C1B1B",
    fontFamily: font.MonolithRegular

  },
  tabTextActive: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: font.MonolithRegular
  },

  /* cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderColor: "#eee",
    borderWidth: 1,

    // ✅ iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    color: "black",
    fontWeight: "700",
  },
  phone: {
    marginTop: 2,
    fontSize: 13,
    color: "#9DB2BF",
    fontFamily: font.MonolithRegular,
  },
  statusPill: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: font.MonolithRegular,
  },
  code: {
    marginLeft: 52, // align under name (40 avatar + 12 gap)
    fontSize: 12,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },

  splitter: {
    borderWidth: 0.5,
    borderColor: "#D9D9D9",
    marginTop: 10,
    marginBottom: 5
  },

  stopsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    marginLeft: 8,
  },
  stopLabel: {
    fontSize: 13,
    color: "#3B4051",
    fontWeight: "500"
  },
  stopValue: {
    fontSize: 13,
    color: "#808080",
    marginTop: 4,
    lineHeight: 20,
    fontWeight: "500"
  },

  emptyWrap: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  illustrationWrap: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: 'relative',
  },
  illustrationBg: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFCC00",
    opacity: 0.1,
  },
  emptyIcon: {
    height: 120,
    width: 120,
    resizeMode: 'contain',
  },
  emptyTitle: {
    fontSize: 22,
    color: "#0F172A",
    fontFamily: font.MonolithRegular,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    fontFamily: font.MonolithRegular,
    textAlign: 'center',
    lineHeight: 22,
  },

});
