import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Keyboard
} from "react-native";
import font from "../theme/font";
import imageIndex from "../assets/imageIndex";
import { Image } from "react-native";

const { width, height } = Dimensions.get("window");
const GOOGLE_API_KEY = "AIzaSyDgFGS91BvviXh_f-nmvtEggUHJcaGyUwA";

const AddressModalInput = ({ modalVisible, setModalVisible, value, onChange, onSelect }: any) => {
  const [searchText, setSearchText] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchSuggestions = async (text: string) => {
    console.log("text",text)
    setSearchText(text);
    setHasSearched(true);
    
    if (!text.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_API_KEY}&types=address`
      );
      const data = await response.json();
      if (data.status === "OK" && data.predictions.length > 0) {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.log("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (placeId: string, description: string) => {
    onChange(description);
    setSearchText(description);
    setModalVisible(false);
    setSuggestions([]);
    Keyboard.dismiss();

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const location = data.result.geometry.location;
        onSelect({ latitude: location.lat, longitude: location.lng });
      }
    } catch (error) {
      console.log("Error fetching place details:", error);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setSuggestions([]);
    setHasSearched(false);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setSearchText("");
    setSuggestions([]);
    setHasSearched(false);
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Search Address</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Image source={imageIndex.search1} 
            style={{
              height:22 ,
              width:22
            }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter your address..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={fetchSuggestions}
              autoFocus={true}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {/* {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )} */}
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFCC00" />
            <Text style={styles.loadingText}>Searching addresses...</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {!loading && suggestions.length > 0 ? (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>SUGGESTIONS</Text>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.suggestionItem,
                      index === suggestions.length - 1 && styles.lastItem
                    ]}
                    onPress={() => handleSelect(item.place_id, item.description)}
                  >
                    <View style={styles.locationIcon}>
                      <Text>📍</Text>
                    </View>
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionPrimary}>
                        {item.structured_formatting?.main_text || item.description}
                      </Text>
                      {item.structured_formatting?.secondary_text && (
                        <Text style={styles.suggestionSecondary}>
                          {item.structured_formatting.secondary_text}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          ) : !loading && hasSearched && searchText.length > 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏠</Text>
              <Text style={styles.emptyStateTitle}>No addresses found</Text>
              <Text style={styles.emptyStateText}>
                Try searching with different keywords or check your spelling.
              </Text>
            </View>
          ) : !loading && (
            <View style={styles.initialState}>
              <Text style={styles.initialStateIcon}>📍</Text>
              <Text style={styles.initialStateTitle}>Find your address</Text>
              <Text style={styles.initialStateText}>
                Enter your street address, neighborhood, or city to find your location.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: font.MonolithRegular,
     color: "#000",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "300",
  },
  searchContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  searchInputContainer: {
     backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 0,  // better alignment with TextInput
    marginBottom: 8,
    height: 48,
    justifyContent: "center",
    flexDirection:"row",
    alignItems:"center",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

     borderWidth: 1,
    borderColor: "#eee",
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#000",
    paddingVertical: 8,
    marginLeft:11
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  clearText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "300",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestionsTitle: {
    fontSize: 13,
     color: "#666",
    marginBottom: 15,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  lastItem: {
    marginBottom: 20,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionPrimary: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#000",
    marginBottom: 2,
  },
  suggestionSecondary: {
    fontSize: 14,
    fontFamily: font.MonolithRegular,
    color: "#666",
  },
  chevron: {
    fontSize: 20,
    color: "#ccc",
    fontWeight: "300",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 44,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: font.MonolithRegular,
     color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  initialState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  initialStateIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  initialStateTitle: {
    fontSize: 20,
    fontFamily: font.MonolithRegular,
     color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  initialStateText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default AddressModalInput;