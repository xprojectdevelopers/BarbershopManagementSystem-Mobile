import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getAllEmployees } from '../../lib/supabase/employeeFunctions'

interface BarberItem {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
}

interface BarberNameProps {
  onSelect?: (item: BarberItem) => void;
}

export default function BarberName({ onSelect }: BarberNameProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<BarberItem | null>(null);
  const [dropDownItems, setDropDownItems] = useState<BarberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getCurrentDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  useEffect(() => {
    const fetchBarbers = async () => {
      setLoading(true);
      const result = await getAllEmployees();

      if (result.success && result.data) {
        const today = getCurrentDayName();
        const barbers = result.data
          .filter((employee: any) => employee.Employee_Role?.toLowerCase() === 'barber')
          .map((employee: any) => {
            const workDays = employee.Work_Sched || [];
            const isOffToday = !workDays.includes(today);
            return {
              id: employee.id,
              label: `${employee.Employee_Nickname} - Barber`,
              value: employee.id,
              disabled: isOffToday
            };
          });
        setDropDownItems(barbers);
      } else {
        console.error("Failed to fetch employees:", result.error);
      }
      setLoading(false);
    };
    fetchBarbers();
  }, []);

  const handleSelect = (item: BarberItem): void => {
    if (item.disabled) return; // Prevent selecting disabled items
    setSelectedItem(item)
    setIsOpen(false)
    if (onSelect) {
      onSelect(item)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.droppedBtn}>
          <Text style={styles.placeholderText}>Loading Barbers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.droppedBtn, isOpen && styles.dropdownBtnOpen]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.buttonText, !selectedItem && styles.placeholderText]}
          numberOfLines={1}
        >
          {selectedItem ? selectedItem.label : 'Select Barber'}
        </Text>
        <Text style={styles.arrow}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView showsVerticalScrollIndicator={true} style={styles.scrollView} nestedScrollEnabled={true}>
            {dropDownItems.length > 0 ? (
              dropDownItems.map((item: BarberItem) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    selectedItem?.id === item.id && styles.selected,
                    item.disabled && styles.disabledItem
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={item.disabled ? 1 : 0.7}
                >
                  <Text
                    style={[
                      styles.itemText,
                      selectedItem?.id === item.id && styles.selectedItemText,
                      item.disabled && styles.disabledText,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label} {item.disabled ? '(Off Today)' : ''}
                  </Text>
                  {selectedItem?.id === item.id && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.dropdownItem}>
                <Text style={styles.itemText}>No barbers available.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  droppedBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b1b1b1ff',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  dropdownBtnOpen: {
    borderColor: '#000000ff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#575757ff',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },

  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderTopWidth: 0,
    width: '100%',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  selected: {
    backgroundColor: '#ecececff',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedItemText: {
    color: '#000000ff',
    fontWeight: '500',
  },
  checkMark: {
    fontSize: 16,
    color: '#000000ff',
    fontWeight: 'bold',
  },
  disabledItem: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  disabledText: {
    color: '#999',
    fontStyle: 'italic',
  },

});
