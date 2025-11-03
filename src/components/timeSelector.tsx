import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'; // Import Dimensions
import React, { useState, useEffect } from 'react';

interface TimeSlot {
  id: number;
  time: string;
}

const timeSlots: TimeSlot[] = [
  { id: 1, time: '10:00 am' },
  { id: 2, time: '11:00 am' },
  { id: 3, time: '12:00 pm' },
  { id: 4, time: '1:00 pm' },
  { id: 5, time: '2:00 pm' },
  { id: 6, time: '3:00 pm' },
  { id: 7, time: '4:00 pm' },
  { id: 8, time: '5:00 pm' },
  { id: 9, time: '6:00 pm' },
  { id: 10, time: '6:30 pm' },
  { id: 11, time: '7:00 pm' },
  { id: 12, time: '7:30 pm' },
];

interface BookedUser {
  time: string;
  user: string;
}

interface TimeSelectorProps {
  onTimeSelect?: (time: string) => void;
  disabledTimes?: string[];
  bookedUsers?: BookedUser[];
}

// Get screen width for responsive calculations
const { width } = Dimensions.get('window');

// Define the number of columns and spacing
const numColumns = 3;
const horizontalPadding = 10; // Padding from the edges of the parent wrapper
const buttonMargin = 10; // Space between buttons

export default function TimeSelector({ onTimeSelect, disabledTimes = [], bookedUsers = [] }: TimeSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const handleTimeSelection = (timeSlot: TimeSlot) => {
    if (disabledTimes.includes(timeSlot.time)) {
      return;
    }

    const newSelected = timeSlot.id === selectedTime ? null : timeSlot.id;
    setSelectedTime(newSelected);
    if (onTimeSelect && newSelected) {
      onTimeSelect(timeSlot.time);
    } else if (onTimeSelect && newSelected === null) { // Allow deselection to trigger null
        onTimeSelect(''); // Or pass null, depending on desired behavior
    }
  };

  const getButtonStyle = (timeSlot: TimeSlot) => {
    // Calculate button width dynamically
    // The parent (inputWrapper) is 90% of screen width.
    // So, we take 90% of screen width, subtract total padding and margins, then divide by numColumns.
    const availableWidth = width * 0.9 - (horizontalPadding * 2) - (buttonMargin * (numColumns - 1));
    const buttonWidth = availableWidth / numColumns;

    if (disabledTimes.includes(timeSlot.time)) {
      return { ...styles.selectorBase, ...styles.selectorDisabled, width: buttonWidth };
    }
    if (selectedTime === timeSlot.id) {
      return { ...styles.selectorBase, ...styles.selectorActive, width: buttonWidth };
    }
    return { ...styles.selectorBase, ...styles.selector, width: buttonWidth };
  };

  const getTextStyle = (timeSlot: TimeSlot) => {
    if (disabledTimes.includes(timeSlot.time)) {
      return styles.selectorDisabledText;
    }
    if (selectedTime === timeSlot.id) {
      return styles.selectorActiveText;
    }
    return styles.selectorText;
  };

  const getBookedUser = (time: string) => {
    const booked = bookedUsers.find(b => b.time === time);
    return booked ? booked.user : null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {timeSlots.map((timeSlot) => {
          const bookedUser = getBookedUser(timeSlot.time);
          return (
            <TouchableOpacity
              key={timeSlot.id}
              style={getButtonStyle(timeSlot)}
              onPress={() => handleTimeSelection(timeSlot)}
              disabled={disabledTimes.includes(timeSlot.time)}
            >
              <Text style={getTextStyle(timeSlot)}>
                {timeSlot.time}
              </Text>

            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Removed fixed 'left: 40' and 'top: 20'.
    // The parent <View style={styles.inputWrapper}> in AppointmentScreen will handle alignment.
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute items evenly
    paddingHorizontal: horizontalPadding, // Add padding inside the grid
  },
  selectorBase: { // Common styles for all selectors
    height: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: buttonMargin, // Margin for vertical spacing
    borderRadius: 5, // Added a slight border radius for aesthetics
  },
  selectorActive: {
    backgroundColor: 'black',
    borderColor: 'black', // Ensure border color matches background
  },
  selectorActiveText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: 'white',
  },
  selector: {
    backgroundColor: 'white',
    borderColor: '#b1b1b1', // Use a consistent border color
  },
  selectorText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: 'black',
  },
  selectorDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0', // Lighter border for disabled
  },
  selectorDisabledText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#999',
  },

});
