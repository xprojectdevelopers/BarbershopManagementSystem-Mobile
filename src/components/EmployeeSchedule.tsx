import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
  FlatList,
  Animated,
} from 'react-native';
import { getAllEmployees, getEmployeeById, getEmployeeByNickname } from '../lib/supabase/employeeFunctions';
import { supabase } from '../lib/supabase/client';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Employee {
  id: string;
  Full_Name: string;
  Employee_Role: string;
  Barber_Expert: string;
  Work_Sched?: string[] | string;
  Photo: string;
}

interface EmployeeScheduleProps {
  barberId?: string;
}

// Optimized Employee Card Component
const EmployeeCard = memo(({ 
  item, 
  photoUrl, 
  hasImageError, 
  workSchedule, 
  onImageError 
}: { 
  item: Employee; 
  photoUrl: string | null; 
  hasImageError: boolean; 
  workSchedule: string;
  onImageError: (id: string) => void;
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageLoadStart = useCallback(() => {
    setImageLoading(true);
  }, []);

  const handleImageError = useCallback(() => {
    onImageError(item.id);
    setImageLoading(false);
  }, [item.id, onImageError]);

  return (
    <View style={styles.slide}>
      <View style={styles.employeeCard}>
        <View style={styles.imageContainer}>
          {photoUrl && !hasImageError ? (
            <>
              <Image
                source={{ uri: photoUrl }}
                style={styles.employeeImage}
                resizeMode="cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
                onLoadStart={handleImageLoadStart}
              />
              {imageLoading && (
                <View style={styles.imageLoadingOverlay}>
                  <Text style={styles.loadingImageText}>Loading...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.employeeImagePlaceholder}>
              <Ionicons name="person" size={50} color="#ffffff" />
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.employeeName}>{item.Full_Name}</Text>
          <Text style={styles.employeeRole}>{item.Employee_Role}</Text>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Expertise:</Text>
            <Text style={styles.infoText}>
              {item.Barber_Expert || 'No expertise specified'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Working Days:</Text>
            <Text style={styles.infoText}>
              {workSchedule}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Comprehensive comparison to prevent unnecessary re-renders
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.photoUrl === nextProps.photoUrl &&
    prevProps.hasImageError === nextProps.hasImageError &&
    prevProps.workSchedule === nextProps.workSchedule
  );
});

EmployeeCard.displayName = 'EmployeeCard';

export default function EmployeeSchedule({ barberId }: EmployeeScheduleProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<Employee>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [employeesOffToday, setEmployeesOffToday] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Memoize current day name to prevent recalculations
  const currentDayName = React.useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const parseWorkSchedule = useCallback((workSched: string[] | string | undefined): string[] => {
    if (!workSched) return [];

    if (Array.isArray(workSched)) {
      return workSched;
    }

    if (typeof workSched === 'string') {
      return workSched.split(',').map(day => day.trim()).filter(day => day.length > 0);
    }

    return [];
  }, []);

  const isEmployeeOffToday = useCallback((employee: Employee): boolean => {
    const workDays = parseWorkSchedule(employee.Work_Sched);
    return !workDays.includes(currentDayName);
  }, [parseWorkSchedule, currentDayName]);

  const fetchEmployeesOffToday = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllEmployees();

      if (result.success && result.data) {
        const employeesOff = result.data.filter((employee: any) => {
          return isEmployeeOffToday(employee) && employee.Employee_Role === 'Barber';
        });

        setEmployeesOffToday(employeesOff);
      } else {
        setEmployeesOffToday([]);
      }
    } catch (error) {
      console.log('Error fetching employees:', error);
      setEmployeesOffToday([]);
    } finally {
      setLoading(false);
    }
  }, [isEmployeeOffToday]);

  const fetchSelectedEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // Try to fetch by nickname first, then by ID if that fails
      let result = await getEmployeeByNickname(id);
      if (!result.success || !result.data) {
        result = await getEmployeeById(id);
      }
      if (result.success && result.data) {
        setSelectedEmployee(result.data);
      } else {
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.log('Error fetching selected employee:', error);
      setSelectedEmployee(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (barberId) {
      fetchSelectedEmployee(barberId);
    } else {
      fetchEmployeesOffToday();
    }
  }, [barberId, fetchSelectedEmployee, fetchEmployeesOffToday]);

  const handleImageError = useCallback((employeeId: string) => {
    setImageErrors(prev => new Set(prev).add(employeeId));
  }, []);

  const getPhotoUrl = useCallback((photoData: string) => {
    if (!photoData) return null;

    // If it's already a full URL
    if (photoData.startsWith('http://') || photoData.startsWith('https://')) {
      return photoData;
    }

    try {
      // Remove any leading slashes
      const cleanPath = photoData.replace(/^\/+/, '');
      
      const { data } = supabase.storage
        .from('barbers_bucket')
        .getPublicUrl(cleanPath);
      
      return data.publicUrl;
    } catch (error) {
      console.log('Error constructing photo URL:', error);
      return null;
    }
  }, []);

  const formatWorkSchedule = useCallback((workSched: string[] | string | undefined): string => {
    const workDays = parseWorkSchedule(workSched);

    if (workDays.length === 0) {
      return 'No schedule specified';
    }

    return workDays.join(', ');
  }, [parseWorkSchedule]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index % employeesOffToday.length);
  }, [employeesOffToday.length]);

  // Optimized auto-scroll with proper cleanup
  useEffect(() => {
    if (employeesOffToday.length <= 1) return; // No auto-scroll for single item
    
    let interval: NodeJS.Timeout;
    
    if (employeesOffToday.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % employeesOffToday.length;
          flatListRef.current?.scrollToIndex({ 
            index: nextIndex, 
            animated: true 
          });
          return nextIndex;
        });
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [employeesOffToday]);

  // Memoized renderItem function
  const renderItem = useCallback(({ item }: { item: Employee }) => {
    const photoUrl = getPhotoUrl(item.Photo);
    const hasImageError = imageErrors.has(item.id);
    const workSchedule = formatWorkSchedule(item.Work_Sched);

    return (
      <EmployeeCard
        item={item}
        photoUrl={photoUrl}
        hasImageError={hasImageError}
        workSchedule={workSchedule}
        onImageError={handleImageError}
      />
    );
  }, [getPhotoUrl, imageErrors, formatWorkSchedule, handleImageError]);

  const keyExtractor = useCallback((item: Employee) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    []
  );

  // Memoize dot indicators
  const renderDotIndicator = useCallback(() => {
    if (employeesOffToday.length <= 1) return null;
    
    return (
      <View style={styles.dotsContainer}>
        {employeesOffToday.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View 
              key={index.toString()} 
              style={[styles.dot, { width: dotWidth }]} 
            />
          );
        })}
      </View>
    );
  }, [employeesOffToday, scrollX]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading employee schedule...</Text>
      </View>
    );
  }

  // Render single selected employee
  if (barberId && selectedEmployee) {
    const photoUrl = getPhotoUrl(selectedEmployee.Photo);
    const hasImageError = imageErrors.has(selectedEmployee.id);
    const workSchedule = formatWorkSchedule(selectedEmployee.Work_Sched);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Selected Barber Schedule</Text>
        <View style={styles.selectedEmployeeCard}>
          <View style={styles.imageContainer}>
            {photoUrl && !hasImageError ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.employeeImage}
                resizeMode="cover"
                onError={() => handleImageError(selectedEmployee.id)}
              />
            ) : (
              <View style={styles.employeeImagePlaceholder}>
                <Ionicons name="person" size={50} color="#ffffff" />
                <Text style={styles.placeholderText}>No Photo</Text>
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.employeeName}>{selectedEmployee.Full_Name}</Text>
            <Text style={styles.employeeRole}>{selectedEmployee.Employee_Role}</Text>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Expertise:</Text>
              <Text style={styles.infoText}>
                {selectedEmployee.Barber_Expert || 'No expertise specified'}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Working Days:</Text>
              <Text style={styles.infoText}>
                {workSchedule}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Render carousel of employees off today
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Employees Off Today ({currentDayName})
      </Text>

      {employeesOffToday.length === 0 ? (
        <View style={styles.noEmployeesContainer}>
          <Text style={styles.noEmployeesText}>All employees are working today</Text>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={employeesOffToday}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={onMomentumScrollEnd}
            getItemLayout={getItemLayout}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={true}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="center"
            disableIntervalMomentum={true}
          />
          {renderDotIndicator()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Regular',
    color: '#666',
    textAlign: 'center',
    marginVertical: 40,
  },
  noEmployeesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  noEmployeesText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#6c757d',
    textAlign: 'center',
  },
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: width * 0.1,
  },
  employeeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    minHeight: 400,
    width: width * 0.85,
    alignSelf: 'center',
    right: 20
  },
  selectedEmployeeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    minHeight: 400,
    marginHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  employeeImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f8f9fa',
  },
  employeeImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImageText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Satoshi-Regular',
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  employeeName: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  employeeRole: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
});
