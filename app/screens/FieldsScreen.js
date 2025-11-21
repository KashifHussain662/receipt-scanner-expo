import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { firebaseService } from "../../services/firebaseService";
import { updateVendor } from "../../store/vendorsSlice";

const FieldsScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const dispatch = useDispatch();
  const { vendors } = useSelector((state) => state.vendors);

  const [modalVisible, setModalVisible] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [defaultValue, setDefaultValue] = useState("");

  const currentVendor = vendors.find((v) => v.id === vendor.id);
  const fields = currentVendor?.fields || [];

  const createField = async () => {
    if (!fieldName.trim()) {
      Alert.alert("Error", "Please enter field name");
      return;
    }

    const fieldKey = fieldName.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // Check if field already exists
    if (fields.some((f) => f.key === fieldKey)) {
      Alert.alert("Error", "Field already exists");
      return;
    }

    const newField = {
      key: fieldKey,
      label: fieldName.trim(),
      type: fieldType,
      defaultValue: defaultValue.trim(), // Default value add kiya
      enabled: true,
    };

    const updatedFields = [...fields, newField];

    // Redux update
    dispatch(
      updateVendor({
        id: vendor.id,
        fields: updatedFields,
      })
    );

    // Firebase update
    const updatedVendor = { ...currentVendor, fields: updatedFields };
    await firebaseService.saveVendor(updatedVendor);

    setFieldName("");
    setDefaultValue("");
    setModalVisible(false);
    Alert.alert("Success", "Field created!");
  };

  const deleteField = async (fieldKey) => {
    Alert.alert("Delete Field", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const updatedFields = fields.filter((f) => f.key !== fieldKey);

          // Redux update
          dispatch(
            updateVendor({
              id: vendor.id,
              fields: updatedFields,
            })
          );

          // Firebase update
          const updatedVendor = { ...currentVendor, fields: updatedFields };
          await firebaseService.saveVendor(updatedVendor);

          Alert.alert("Success", "Field deleted!");
        },
      },
    ]);
  };

  const toggleField = async (fieldKey) => {
    const updatedFields = fields.map((f) =>
      f.key === fieldKey ? { ...f, enabled: !f.enabled } : f
    );

    // Redux update
    dispatch(
      updateVendor({
        id: vendor.id,
        fields: updatedFields,
      })
    );

    // Firebase update
    const updatedVendor = { ...currentVendor, fields: updatedFields };
    await firebaseService.saveVendor(updatedVendor);
  };

  const renderField = ({ item }) => (
    <View style={styles.fieldCard}>
      <View style={styles.fieldInfo}>
        <Text style={styles.fieldName}>{item.label}</Text>
        <Text style={styles.fieldKey}>{item.key}</Text>
        <Text style={styles.fieldType}>Type: {item.type}</Text>
        {item.defaultValue && (
          <Text style={styles.defaultValue}>Default: {item.defaultValue}</Text>
        )}
      </View>

      <View style={styles.fieldActions}>
        <TouchableOpacity onPress={() => toggleField(item.key)}>
          <Ionicons
            name={item.enabled ? "eye" : "eye-off"}
            size={20}
            color={item.enabled ? "green" : "red"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteField(item.key)}>
          <Ionicons name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Vendor Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.vendorName}>{vendor.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{fields.length}</Text>
          <Text style={styles.statLabel}>Total Fields</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {fields.filter((f) => f.enabled).length}
          </Text>
          <Text style={styles.statLabel}>Active Fields</Text>
        </View>
      </View>

      {/* Fields List */}
      <View style={styles.listContainer}>
        <Text style={styles.title}>Fields</Text>

        {fields.length > 0 ? (
          <FlatList
            data={fields}
            renderItem={renderField}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No fields yet</Text>
            <Text style={styles.emptySubtext}>Add your first field</Text>
          </View>
        )}
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.createButtonText}>Create Field</Text>
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Field</Text>

            <TextInput
              style={styles.input}
              placeholder="Field name"
              value={fieldName}
              onChangeText={setFieldName}
            />

            <TextInput
              style={styles.input}
              placeholder="Default value (optional)"
              value={defaultValue}
              onChangeText={setDefaultValue}
            />

            <Text style={styles.label}>Field Type</Text>
            <View style={styles.typeButtons}>
              {["text", "number", "date", "amount"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    fieldType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFieldType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      fieldType === type && styles.typeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={createField}
              >
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  stat: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    color: "#666",
    marginTop: 5,
  },
  listContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  fieldCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  fieldKey: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  fieldType: {
    color: "#666",
    marginTop: 5,
  },
  defaultValue: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
  fieldActions: {
    flexDirection: "row",
    gap: 15,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  emptySubtext: {
    color: "#999",
    marginTop: 5,
  },
  createButton: {
    backgroundColor: "#6366F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  typeButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    margin: 2,
    flex: 1,
    minWidth: "23%",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#6366F1",
  },
  typeText: {
    color: "#666",
    fontSize: 12,
  },
  typeTextActive: {
    color: "white",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelText: {
    color: "#666",
  },
  createText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default FieldsScreen;
