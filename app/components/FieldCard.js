import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  setEditingField,
  setModalVisible,
  setNewField,
  toggleFieldEnabled,
} from "../../store/fieldsSlice";

const FieldCard = ({ item, index }) => {
  const dispatch = useDispatch();
  const fieldTypes = useSelector((state) => state.fields.fieldTypes);

  const getTypeColor = (type) => {
    const typeConfig = fieldTypes.find((t) => t.value === type);
    return typeConfig ? typeConfig.color : "#6B7280";
  };

  const handleEditField = (field) => {
    if (field.common) {
      Alert.alert("Info", "Common fields cannot be edited.");
      return;
    }
    dispatch(setEditingField(field));
    dispatch(
      setNewField({
        name: field.label,
        label: field.label,
        type: field.type,
      })
    );
    dispatch(setModalVisible(true));
  };

  const handleToggleEnabled = (fieldKey) => {
    dispatch(toggleFieldEnabled(fieldKey));
  };

  return (
    <View
      style={[
        styles.fieldCard,
        item.common && styles.commonFieldCard,
        !item.enabled && styles.disabledFieldCard,
      ]}
    >
      <View style={styles.fieldCardContent}>
        <View style={styles.fieldIconContainer}>
          <Ionicons
            name={fieldTypes.find((t) => t.value === item.type)?.icon || "help"}
            size={20}
            color={getTypeColor(item.type)}
          />
        </View>

        <View style={styles.fieldInfo}>
          <View style={styles.fieldHeader}>
            <Text
              style={[styles.fieldLabel, !item.enabled && styles.disabledText]}
            >
              {item.label}
            </Text>
            <View style={styles.fieldBadges}>
              {item.custom && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>Custom</Text>
                </View>
              )}
              {item.common && (
                <View style={styles.commonBadge}>
                  <Text style={styles.commonBadgeText}>System</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.fieldDetails}>
            <Text style={styles.fieldKey}>@{item.key}</Text>
            <View style={styles.statsContainer}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: getTypeColor(item.type) + "15" },
                ]}
              >
                <Text
                  style={[styles.typeText, { color: getTypeColor(item.type) }]}
                >
                  {item.type}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusToggle,
                  item.enabled ? styles.statusEnabled : styles.statusDisabled,
                ]}
                onPress={() => handleToggleEnabled(item.key)}
                disabled={item.common}
              >
                <View
                  style={[
                    styles.statusDot,
                    item.enabled
                      ? styles.statusDotEnabled
                      : styles.statusDotDisabled,
                  ]}
                />
                <Text style={styles.statusText}>
                  {item.enabled ? "Active" : "Inactive"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {item.custom && (
        <View style={styles.fieldActions}>
          <TouchableOpacity
            onPress={() => handleEditField(item)}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteField(item.key)}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 80,
  },
  commonFieldCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
  },
  disabledFieldCard: {
    opacity: 0.6,
  },
  fieldCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  fieldInfo: {
    flex: 1,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  fieldKey: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "monospace",
    fontWeight: "500",
    marginBottom: 6,
  },
  fieldBadges: {
    flexDirection: "row",
    gap: 4,
  },
  customBadge: {
    backgroundColor: "#FAF5FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customBadgeText: {
    fontSize: 9,
    color: "#8B5CF6",
    fontWeight: "700",
  },
  commonBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  commonBadgeText: {
    fontSize: 9,
    color: "#059669",
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusEnabled: {
    backgroundColor: "#F0FDF4",
  },
  statusDisabled: {
    backgroundColor: "#FEF2F2",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotEnabled: {
    backgroundColor: "#10B981",
  },
  statusDotDisabled: {
    backgroundColor: "#EF4444",
  },
  statusText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "600",
  },
  fieldActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledText: {
    color: "#9CA3AF",
  },
});

export default FieldCard;
