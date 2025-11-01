import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAllCustomerProfiles, CustomerProfile } from '../../lib/supabase/profileFunctions';

export default function UserListScreen() {
  const [users, setUsers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllCustomerProfiles();
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      Alert.alert('Error', 'Failed to fetch users');
    }
    setLoading(false);
  };

  const renderUser = ({ item }: { item: CustomerProfile }) => (
    <TouchableOpacity style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.displayName}>
          {item.display_name || 'No Display Name'}
        </Text>
        <Text style={styles.username}>
          @{item.username || 'No Username'}
        </Text>
        <Text style={styles.email}>
          {item.email || 'No Email'}
        </Text>
        <Text style={styles.contact}>
          {item.contact_number || 'No Contact Number'}
        </Text>
        <Text style={styles.createdAt}>
          Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Users</Text>
      <Text style={styles.subtitle}>Total: {users.length} users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 3,
  },
  contact: {
    fontSize: 14,
    color: '#888',
    marginBottom: 3,
  },
  createdAt: {
    fontSize: 12,
    color: '#aaa',
  },
});
