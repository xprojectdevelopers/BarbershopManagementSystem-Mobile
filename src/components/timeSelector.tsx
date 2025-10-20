import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

interface TimeSlot {
  id: number
  time: string
}

const timeSlots: TimeSlot[] = [
  { id: 1, time: '10:00 am' },
  { id: 2, time: '11:00 am' },
  { id: 3, time: '12:00 am' },
  { id: 4, time: '1:00 pm' },
  { id: 5, time: '2:00 pm' },
  { id: 6, time: '3:00 pm' },
  { id: 7, time: '4:00 pm' },
  { id: 8, time: '5:00 pm' },
  { id: 9, time: '6:00 pm' },
  { id: 10, time: '6:30 pm' },
  { id: 11, time: '7:00 pm' },
  { id: 12, time: '7:30 pm' },
]

interface TimeSelectorProps {
  onTimeSelect?: (time: string) => void;
}

export default function TimeSelector({ onTimeSelect }: TimeSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<number | null>(null)

  const handleTimeSelection = (timeSlot: TimeSlot) => {
    const newSelected = timeSlot.id === selectedTime ? null : timeSlot.id
    setSelectedTime(newSelected)
    if (onTimeSelect && newSelected) {
      onTimeSelect(timeSlot.time)
    }
  }

  const getButtonStyle = (timeSlot: TimeSlot) => {
    if (selectedTime === timeSlot.id) {
      return styles.selectorActive
    }
    return styles.selector
  }

  const getTextStyle = (timeSlot: TimeSlot) => {
    if (selectedTime === timeSlot.id) {
      return styles.selectorActiveText
    }
    return styles.selectorText
  }

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {timeSlots.map((timeSlot) => (
          <TouchableOpacity
            key={timeSlot.id}
            style={getButtonStyle(timeSlot)}
            onPress={() => handleTimeSelection(timeSlot)}
          >
            <Text style={getTextStyle(timeSlot)}>
              {timeSlot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    left: 40,
    top: 20
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  selectorActive: {
    width: 100,
    height: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    marginRight: 10,
    marginBottom: 10,
  },
  selectorActiveText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: 'white'
  },
  selector: {
    width: 100,
    height: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginRight: 10,
    marginBottom: 10,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: 'black'
  }
})