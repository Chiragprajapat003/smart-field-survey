import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import * as Contacts from "expo-contacts";
import * as Clipboard from "expo-clipboard";
import { useSurveys } from "@/context/SurveyContext";

const SAMPLE_CONTACTS = [
  { id: "c1", name: "Rajesh Sharma", phoneNumbers: [{ number: "+91 98765 43210" }] },
  { id: "c2", name: "Anil Patel", phoneNumbers: [{ number: "+91 91234 56789" }] },
  { id: "c3", name: "Priya Mehta", phoneNumbers: [{ number: "+91 99887 76655" }] },
  { id: "c4", name: "Vikram Singh", phoneNumbers: [{ number: "+91 97112 23344" }] },
  { id: "c5", name: "Sunita Verma", phoneNumbers: [{ number: "+91 94140 55667" }] },
];

const ContactsScreen = () => {
  const router = useRouter();
  const { surveys, updateSurvey } = useSurveys();

  const [contacts, setContacts] = useState(SAMPLE_CONTACTS);
  const [filteredContacts, setFilteredContacts] = useState(SAMPLE_CONTACTS);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSelectSurveyModalOpen, setIsSelectSurveyModalOpen] = useState(false);

  useEffect(() => {
    getContacts();
  }, []);

  const getContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        if (data && data.length > 0) {
          setContacts(data);
          setFilteredContacts(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Using sample contacts fallback", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getContacts();
    setRefreshing(false);
  };

  const searchContacts = (text) => {
    setSearch(text);
    const filtered = contacts.filter((contact) => {
      const name = contact.name?.toLowerCase() || "";
      const number = contact.phoneNumbers?.[0]?.number || "";
      return (
        name.includes(text.toLowerCase()) ||
        number.replace(/\s/g, "").includes(text.replace(/\s/g, ""))
      );
    });
    setFilteredContacts(filtered);
  };

  const copyNumber = async (number) => {
    if (!number || number === "No Number") {
      Alert.alert("No Number", "This contact has no phone number.");
      return;
    }
    await Clipboard.setStringAsync(number);
    Alert.alert("Copied", "Phone number copied to clipboard.");
  };

  const handleSelectContactForAttach = (contact) => {
    setSelectedContact(contact);
    setIsSelectSurveyModalOpen(true);
  };

  const handleAttachContactToSurvey = (surveyId) => {
    if (!selectedContact) return;
    const num = selectedContact.phoneNumbers?.[0]?.number || "";
    updateSurvey(surveyId, {
      contactName: selectedContact.name,
      contactNumber: num,
    });
    setIsSelectSurveyModalOpen(false);
    Alert.alert("✅ Contact Connected", `Contact attached to Survey #${surveyId}`, [
      {
        text: "View Survey",
        onPress: () =>
          router.push({
            pathname: "/survey-preview",
            params: { surveyId },
          }),
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const number = item.phoneNumbers?.[0]?.number || "No Number";

    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name ? item.name[0].toUpperCase() : "?"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.number}>{number}</Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => copyNumber(number)}
          >
            <Ionicons name="copy-outline" size={18} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.attachIconBtn]}
            onPress={() => handleSelectContactForAttach(item)}
          >
            <Ionicons name="link-sharp" size={18} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <DrawerToggleButton tintColor="#fff" />
        <Text style={styles.headerTitle}>Site Contacts</Text>
        <Ionicons name="people" size={22} color="#fff" />
      </View>

      <View style={styles.container}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search contact by name or number..."
            style={styles.search}
            value={search}
            onChangeText={searchContacts}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.counterRow}>
          <Text style={styles.counter}>
            Found <Text style={{ color: "#2563EB" }}>{filteredContacts.length}</Text> Site Contacts
          </Text>
          <Text style={styles.hintText}>Tap 🔗 to link contact to a survey</Text>
        </View>

        {filteredContacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-remove-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No Contacts Found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id || item.name}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      {/* Select Target Survey Modal */}
      <Modal visible={isSelectSurveyModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Link {selectedContact?.name} to Survey
              </Text>
              <TouchableOpacity onPress={() => setIsSelectSurveyModalOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionDividerText}>SELECT TARGET SURVEY</Text>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {surveys.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.surveySelectCard}
                  onPress={() => handleAttachContactToSurvey(s.id)}
                >
                  <View style={styles.surveySelectRow}>
                    <Text style={styles.surveySelectId}>{s.id}</Text>
                    <Text style={styles.surveySelectStatus}>{s.status}</Text>
                  </View>
                  <Text style={styles.surveySelectSite}>{s.siteName}</Text>
                  <Text style={styles.surveySelectClient}>Client: {s.clientName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 14,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  container: { flex: 1, padding: 16 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    gap: 8,
  },
  search: { flex: 1, fontSize: 15, color: "#111827" },

  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  counter: { fontSize: 14, fontWeight: "600", color: "#374151" },
  hintText: { fontSize: 11, color: "#6B7280" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  number: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  actionGroup: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  attachIconBtn: { backgroundColor: "#D1FAE5" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyText: { fontSize: 16, color: "#9CA3AF", marginTop: 12 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", flex: 1 },
  sectionDividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  surveySelectCard: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  surveySelectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  surveySelectId: { fontSize: 12, fontWeight: "700", color: "#2563EB" },
  surveySelectStatus: { fontSize: 11, color: "#059669", fontWeight: "600" },
  surveySelectSite: { fontSize: 15, fontWeight: "bold", color: "#111827" },
  surveySelectClient: { fontSize: 13, color: "#6B7280" },
});