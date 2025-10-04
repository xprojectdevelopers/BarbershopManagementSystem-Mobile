import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

// Define the type for dropdown items
interface ServiceItem {
  id: number;
  name: string;
  price: string;
}

interface ServicesProps {
  onSelect?: (item: ServiceItem) => void;
}

export default function Services({ onSelect }: ServicesProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);

  const dropDownItems: ServiceItem[] = [
     { id: 1, name: 'Haircut(Walk in)', price: '₱150' },
     { id: 2, name: 'Reservation(Walk in)', price: '₱200' },
     { id: 3, name: 'Haircut/Wash', price: '₱250' },
     { id: 4, name: 'Haircut/Hot Towel', price: '₱250' },
     { id: 5, name: 'Hairdye/Haircut', price: '₱350' },
     { id: 6, name: 'Hair color/Haircut', price: '₱400' },
     { id: 7, name: 'Highlights/Haircut', price: '₱500' },
     { id: 8, name: 'Balyage/Haircut', price: '₱500' },
     { id: 9, name: 'Bleaching/Haircut', price: '₱800' },
     { id: 10, name: 'Perm/Haircut', price: '₱1000' },
     { id: 11, name: 'Rebond/ShortHair', price: '₱1000' },
     { id: 12, name: 'Rebound/LongHair', price: '₱1500' }
  ]

  const handleSelect = (item: ServiceItem): void => {
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
          {selectedItem ? `${selectedItem.price} - ${selectedItem.name}` : 'Select Service'}
        </Text>
        <Text style={styles.arrow}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView showsVerticalScrollIndicator={true} style={styles.scrollView} nestedScrollEnabled={true}>
            {dropDownItems.map((item: ServiceItem) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dropdownItem,
                  selectedItem?.id === item.id && styles.selected
                ]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.itemContent}>
                  <Text style={[
                    styles.itemText,
                    selectedItem?.id === item.id && styles.selectedItemText
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={[
                    styles.priceText,
                    selectedItem?.id === item.id && styles.selectedPriceText
                  ]}>
                    {item.price}
                  </Text>
                </View>
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
    marginTop: 20,
    alignItems: 'center',
    right: 5,
    bottom: 20 // Changed from 'right: 15' to proper padding
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
    width: '100%',
    maxWidth: 380,
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
    borderColor: '#000',
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
    borderColor: '#000',
    borderTopWidth: 0,
    width: '100%',
    maxWidth: 380,
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
    backgroundColor: '#ececec',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginLeft: 10,
  },
  selectedItemText: {
    color: '#000',
    fontWeight: '500',
  },
  selectedPriceText: {
    color: '#000',
    fontWeight: '700',
  },
  checkMark: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 10,
  },
})
