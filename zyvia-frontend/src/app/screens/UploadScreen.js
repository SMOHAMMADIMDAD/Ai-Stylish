// app/screens/UploadScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

export default function UploadScreen() {
  const [name, setName] = useState('');
  const [clothingType, setClothingType] = useState('top');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleUpload = () => {
    if (!name || !image) {
      Alert.alert('Please enter all fields');
      return;
    }

    // You’ll add image upload logic here with formData
    Alert.alert('Uploaded successfully (demo)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Clothing Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter item name"
        value={name}
        onChangeText={setName}
      />

      <Picker
        selectedValue={clothingType}
        onValueChange={(itemValue) => setClothingType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Top" value="top" />
        <Picker.Item label="Bottom" value="bottom" />
        <Picker.Item label="Shoes" value="shoes" />
        <Picker.Item label="Outerwear" value="outerwear" />
      </Picker>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>
          {image ? 'Change Image' : 'Pick an Image'}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button title="Upload" onPress={handleUpload} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  imagePicker: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
  },
});
