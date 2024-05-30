import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput, FlatList, Image, TouchableOpacity } from "react-native";
import { firestore } from "../utils/FireBase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const UpdateScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "images"));
      const imagesData = [];
      querySnapshot.forEach((doc) => {
        imagesData.push({ ...doc.data(), id: doc.id });
      });
      imagesData.sort((a, b) => b.timestamp - a.timestamp);
      setImages(imagesData);
    } catch (error) {
      setError(`Error al obtener las imágenes: ${error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedImage) {
      setError("Seleccione una imagen para actualizar.");
      return;
    }
    try {
      await updateDoc(doc(firestore, "images", selectedImage.id), { description });
      fetchImages();
      setSelectedImage(null);
      setDescription("");
    } catch (error) {
      setError(`Error al actualizar la imagen: ${error.message}`);
    }
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    setDescription(image.description || "");
    setError(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectImage(item)}>
            <View style={styles.imageContainer}>
              <Text>{item.projectName} - ID: {item.id}</Text>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            </View>
          </TouchableOpacity>
        )}
      />
      {selectedImage && (
        <View style={styles.selectedImageContainer}>
          <Image source={{ uri: selectedImage.imageUrl }} style={styles.selectedImage} />
          <TextInput
            style={styles.input}
            placeholder="Nueva descripción"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Actualizar descripción</Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f7fa",
    paddingTop: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 10,
  },
  input: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  selectedImageContainer: {
    alignItems: "center",
  },
  selectedImage: {
    width: 300,
    height: 300,
    marginVertical: 10,
  },
});

export default UpdateScreen;
