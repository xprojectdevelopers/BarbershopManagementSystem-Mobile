import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

interface BarberItem {
  id: number;
  label: string;
  value: string;
}

interface BarberNameProps {
  onSelect?: (item: BarberItem) => void;
}

export default function BarberName({ onSelect }: BarberNameProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<BarberItem | null>(null);

  const dropDownItems: BarberItem[] = [
    { id: 1, label: 'Barber - John Doe', value: 'john_doe' },
    { id: 2, label: 'Barber - Jane Doe', value: 'jane_doe' },
    { id: 3, label: 'Barber - Janet Doe', value: 'janet_doe' },
    { id: 4, label: 'Barber - Jack Doe', value: 'jack_doe' },
    { id: 5, label: 'Barber - Jim Doe', value: 'jim_doe' }
  ]

  const handleSelect = (item: BarberItem): void => {
    setSelectedItem(item)
    setIsOpen(false)
    if (onSelect) {
      onSelect(item)
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.droppedBtn, isOpen && styles.dropdownBtnOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.buttonText, !selectedItem && styles.placeholderText]}>
          {selectedItem ? selectedItem.label : 'Select Barber'}
        </Text>
        <Text style={styles.arrow}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView showsVerticalScrollIndicator={true} style={styles.scrollView} nestedScrollEnabled={true}>
            {dropDownItems.map((item: BarberItem) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dropdownItem,
                  selectedItem?.id === item.id && styles.selected
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={[
                  styles.itemText,
                  selectedItem?.id === item.id && styles.selectedItemText
                ]}>
                  {item.label}
                </Text>
                {selectedItem?.id === item.id && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    left: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  droppedBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b1b1b1ff',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    width: 370,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownBtnOpen: {
    borderColor: '#000000ff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
    borderTopWidth: 0,
    width: 370,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    height: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
})
