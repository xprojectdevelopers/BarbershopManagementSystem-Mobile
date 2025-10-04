import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

interface Album {
  name: string;
  images: any[];
}

interface AlbumTableProps {
  albums: Album[];
  onAlbumSelect: (images: any[]) => void;
}

const AlbumTable: React.FC<AlbumTableProps> = ({ albums, onAlbumSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Albums</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {albums.map((album, index) => (
          <TouchableOpacity
            key={index}
            style={styles.albumItem}
            onPress={() => onAlbumSelect(album.images)}
          >
            <Text style={styles.albumText}>{album.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '95%',
    alignSelf: 'center',
    marginTop: 30,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 10,
    marginLeft: 15,
  },
  scrollView: {
    paddingHorizontal: 15,
  },
  albumItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  albumText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
  },
});

export default AlbumTable;
