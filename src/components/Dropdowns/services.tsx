import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { getServicesByBarberNickname, Service } from '../../lib/supabase/serviceFunctions';

// Define the type for dropdown items
interface ServiceItem {
  id: number;
  name: string;
  price: string;
}

interface ServicesProps {
  onSelect?: (item: ServiceItem) => void;
  barberId?: string;
}

export default function Services({ onSelect, barberId }: ServicesProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const [dropDownItems, setDropDownItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (barberId) {
      fetchServices();
    } else {
      // Default services if no barber selected
      setDropDownItems([
        { id: 1, name: 'Haircut (Walk-in)', price: '₱150' },
        { id: 2, name: 'Reservation (Walk-in)', price: '₱200' },
        { id: 3, name: 'Haircut/Wash', price: '₱250' },
        { id: 4, name: 'Haircut/Hot Towel', price: '₱250' },
        { id: 5, name: 'Hairdye/Haircut', price: '₱350' },
        { id: 6, name: 'Hair Color/Haircut', price: '₱400' },
        { id: 7, name: 'Highlights/Haircut', price: '₱500' },
        { id: 8, name: 'Balayage/Haircut', price: '₱500' },
        { id: 9, name: 'Bleaching/Haircut', price: '₱800' },
        { id: 10, name: 'Perm/Haircut', price: '₱1000' },
        { id: 11, name: 'Rebond/Short Hair', price: '₱1000' },
        { id: 12, name: 'Rebond/Long Hair', price: '₱1500' }
      ]);
    }
  }, [barberId]);

  const fetchServices = async () => {
    if (!barberId) return;

    setLoading(true);
    try {
      const result = await getServicesByBarberNickname(barberId);
      if (result.success && result.data) {
        console.log('Fetched services:', result.data); // Debug log
        const services: ServiceItem[] = result.data.map((service: Service, index: number) => ({
          id: index + 1,
          name: service.Service,
          price: `₱${service.Price}`
        }));
        setDropDownItems(services);
      } else {
        console.error('Failed to fetch services:', result.error);
        // Fallback to default services
        setDropDownItems([
          { id: 1, name: 'Haircut (Walk-in)', price: '₱150' },
          { id: 2, name: 'Reservation (Walk-in)', price: '₱200' },
          { id: 3, name: 'Haircut/Wash', price: '₱250' },
          { id: 4, name: 'Haircut/Hot Towel', price: '₱250' },
          { id: 5, name: 'Hairdye/Haircut', price: '₱350' },
          { id: 6, name: 'Hair Color/Haircut', price: '₱400' },
          { id: 7, name: 'Highlights/Haircut', price: '₱500' },
          { id: 8, name: 'Balayage/Haircut', price: '₱500' },
          { id: 9, name: 'Bleaching/Haircut', price: '₱800' },
          { id: 10, name: 'Perm/Haircut', price: '₱1000' },
          { id: 11, name: 'Rebond/Short Hair', price: '₱1000' },
          { id: 12, name: 'Rebond/Long Hair', price: '₱1500' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: ServiceItem): void => {
    setSelectedItem(item);
    setIsOpen(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.droppedBtn, isOpen && styles.dropdownBtnOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.buttonText, !selectedItem && styles.placeholderText]} numberOfLines={1}>
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
                  ]} numberOfLines={1}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    // Removed 'alignItems: center' and 'right: 5' as parent wrapper handles centering
    bottom: 20,
    width: '100%', // Take full width of parent inputWrapper
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
    borderColor: '#b1b1b1', // Removed 'ff' for standard hex color
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    width: '100%', // Make button width responsive
    // Removed 'maxWidth: 370' as width: '100%' within inputWrapper is better
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
    // Removed 'left: 5'
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
    color: '#575757', // Removed 'ff'
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
    width: '100%', // Make dropdown container width responsive
    // Removed 'maxWidth: 380' as width: '100%' within inputWrapper is better
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200, // Use maxHeight for flexibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1, // Ensure dropdown appears above other content
  },
  scrollView: {
    flexGrow: 1, // Allow ScrollView to grow based on content
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
});