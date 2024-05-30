import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { firestore } from "../utils/FireBase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const DeleteScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
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

  const handleDelete = async () => {
    if (!selectedImageId) {
      setError("Seleccione una imagen para borrar.");
      return;
    }
    try {
      await deleteDoc(doc(firestore, "images", selectedImageId));
      fetchImages();
      setSelectedImageId(null);
    } catch (error) {
      setError(`Error al borrar la imagen: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Text>{item.projectName} - ID: {item.id}</Text>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <TouchableOpacity
              style={[
                styles.selectButton,
                selectedImageId === item.id && styles.selectedButton,
              ]}
              onPress={() => setSelectedImageId(item.id)}
            >
              <Text style={styles.buttonText}>Seleccionar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleDelete}
      >
        <Text style={styles.buttonText}>Borrar Imagen</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    paddingTop: 20,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginVertical: 5,
  },
  selectedButton: {
    backgroundColor: "#555555",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default DeleteScreen;
