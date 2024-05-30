import React from "react";
import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Alert, Modal, Button, BackHandler } from "react-native";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, firestore } from "../utils/FireBase";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../utils/FireBase';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, query, where, collection, getDocs, getDoc, doc } from "firebase/firestore";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PDFDocument, rgb } from 'pdf-lib';

class MainScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      userId: "Speqtrum",
      imageUri: "",
      description: "",
      error: null,
      disableTakePhoto: false,
      disableOpenGallery: false,
      isModalVisible: true,
      projectName: "",
      isAdmin: false,
    };
  }

  closeModal = async () => {
    const { projectName } = this.state;
  
    if (projectName.trim() === "") {
      Alert.alert("Error", "Debe ingresar un nombre clave del proyecto.");
      return;
    }
  
    try {
      // Obtener una referencia a la colección de imágenes
      const imagesCollectionRef = collection(firestore, "images");
      
      // Realizar una consulta para buscar imágenes con el mismo nombre de proyecto
      const q = query(imagesCollectionRef, where("projectName", "==", projectName));
      const querySnapshot = await getDocs(q);
  
      // Si se encuentra al menos un documento con el mismo nombre de proyecto, mostrar mensaje de error
      if (!querySnapshot.empty) {
        Alert.alert("Error", "El nombre del proyecto ya existe. Por favor, elija otro nombre.");
        return;
      }
  
      // Si no se encuentra ningún documento con el mismo nombre de proyecto, continuar cerrando el modal y pasar el nombre del proyecto
      this.props.setProjectName(projectName);
      this.setState({ isModalVisible: false });
    } catch (error) {
      console.error("Error al verificar el nombre del proyecto en Firestore:", error);
      Alert.alert("Error", "Hubo un problema al verificar el nombre del proyecto. Por favor, inténtelo de nuevo.");
    }
  };
  
  

  componentDidMount() {
    this.unsubscribe = onAuthStateChanged(auth, this.handleAuthStateChanged);
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton = () => {
    const { navigation } = this.props;
    const currentRoute = navigation.getState().routes[navigation.getState().index].name;

    if (currentRoute === 'Update' || currentRoute === 'Delete') {
      return false;
    }

    Alert.alert(
      "Salir",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", onPress: () => null, style: "cancel" },
        { text: "Sí", onPress: this.handleLogout }
      ],
      { cancelable: false }
    );
    return true;
  };

  handleLogout = async () => {
    try {
      await signOut(auth);
      this.props.navigation.navigate('Login', { resetFields: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Hubo un problema al cerrar la sesión. Por favor, inténtelo de nuevo.");
    }
  };

  handleAuthStateChanged = async (user) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        this.setState({
          userId: user.uid,
          email: userData.email,
          isAdmin: userData.isAdmin,
        });
      } else {
        this.setState({ error: "No se encontró el usuario en Firestore." });
      }
    } else {
      this.setState({ userId: "Speqtrum", email: "", isAdmin: false });
    }
  };

  uploadImage = async (uri, description) => {
    try {
      if (!uri) {
        throw new Error("No hay imagen para subir");
      }

      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Error al cargar la imagen");
      }

      const blob = await response.blob();

      const timestamp = new Date().getTime();
      const { userId, projectName } = this.state;
      const fileName = `${projectName}_image_${timestamp}.png`;

      const imageRef = ref(storage, `images/${userId}/${fileName}`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);
      await addDoc(collection(firestore, "images"), {
        userId: userId,
        projectName: projectName,
        imageUrl: imageUrl,
        description: description || '',
        timestamp: new Date(),
      });

      this.setState({ 
        imageUri: "", 
        description: "", 
        disableTakePhoto: false, 
        disableOpenGallery: false 
      });
      Alert.alert("Éxito", "La imagen y la descripción se han subido correctamente.");
    } catch (error) {
      this.setState({ error: `Error al subir la imagen y la descripción: ${error.message}` });
    }
  };

  takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        this.setState({ error: "Permiso no concedido" });
        return;
      }

      const resultImagePicker = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (resultImagePicker.cancelled) {
        this.setState({ error: "Captura de imagen cancelada" });
        return;
      }

      const imageUri = resultImagePicker.assets[0]?.uri;
      if (!imageUri) {
        this.setState({ error: "Error: la URL de la imagen está vacía." });
        return;
      }

      this.setState({ imageUri, error: null, disableOpenGallery: true });
    } catch (error) {
      this.setState({ error: `Error al abrir la cámara: ${error.message}` });
    }
  };

  openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        this.setState({ error: "Permiso no concedido" });
        return;
      }

      const resultImagePicker = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (resultImagePicker.cancelled) {
        this.setState({ error: "Selección de imagen cancelada" });
        return;
      }

      const imageUri = resultImagePicker.assets[0]?.uri;
      if (!imageUri) {
        this.setState({ error: "Error: la URL de la imagen está vacía." });
        return;
      }

      this.setState({ imageUri, error: null, disableTakePhoto: true });
    } catch (error) {
      this.setState({ error: `Error al abrir la galería: ${error.message}` });
    }
  };

  handleUpload = async () => {
    const { imageUri, description } = this.state;
    if (!imageUri) {
      this.setState({ error: "No hay imagen para subir." });
      return;
    }
    await this.uploadImage(imageUri, description);
  };

  handleGenerateDocument = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "images"));
      let items = [];
  
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const imageUrl = data.imageUrl;
        const description = data.description;
        const timestamp = data.timestamp.toDate();
        const id = doc.id;
        const projectName = data.projectName;
  
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
  
        const contentType = response.headers.get('content-type');
        if (!contentType) {
          throw new Error(`No se pudo determinar el tipo de contenido de la imagen: ${imageUrl}`);
        }
  
        items.push({ imageUrl, image: arrayBuffer, description, contentType, id, timestamp, projectName });
      }
  
      // Ordenar las imágenes por fecha y hora de manera descendente
      items = items.sort((a, b) => b.timestamp - a.timestamp);
  
      const pdfDoc = await PDFDocument.create();
  
      let yPosition = 750;
      let page = pdfDoc.addPage([600, 800]);
  
      for (const item of items) {
        if (yPosition < 150) { 
          page = pdfDoc.addPage([600, 800]);
          yPosition = 750;
        }
  
        let embeddedImage;
        try {
          if (item.contentType === 'image/jpeg' || item.contentType === 'image/jpg') {
            embeddedImage = await pdfDoc.embedJpg(item.image);
          } else if (item.contentType === 'image/png') {
            embeddedImage = await pdfDoc.embedPng(item.image);
          } else {
            throw new Error(`Formato de imagen no soportado: ${item.contentType}`);
          }
  
          const maxWidth = 400; // Ancho máximo ajustado
          const maxHeight = 250; // Altura máxima ajustada
  
          let { width, height } = embeddedImage.scale(1);
  
          // Reducir el tamaño de la imagen si excede el ancho y la altura máximos
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const scale = Math.min(widthRatio, heightRatio);
            width *= scale;
            height *= scale;
          }
  
          const xPosition = (page.getWidth() - width) / 2; 
  
          const title = `Nombre del proyecto: ${item.projectName}\nID: ${item.id} - ${item.timestamp.toLocaleString()}`;
          page.drawText(title, {
            x: 50,
            y: yPosition,
            size: 12,
            color: rgb(0, 0, 0),
          });
  
          yPosition -= 20; 
          yPosition -= 20; // Salto de línea adicional
  
          page.drawImage(embeddedImage, {
            x: xPosition,
            y: yPosition - height,
            width,
            height,
          });
  
          yPosition -= height + 20;
  
          page.drawRectangle({
            x: 50,
            y: yPosition,
            width: 500,
            height: 20,
            color: rgb(0, 123 / 255, 1), 
          });
  
          page.drawText(item.description, {
            x: 55,
            y: yPosition + 5,
            size: 12,
            color: rgb(1, 1, 1), 
          });
          yPosition -= 30; 
        } catch (error) {
          console.error(`Error al procesar la imagen: ${item.imageUrl}. Error: ${error.message}`);
          continue; 
        }
      }
  
      const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: false });
      const fileUri = `${FileSystem.documentDirectory}documento.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Compartir no disponible", `El documento se ha guardado en la siguiente ubicación:\n${fileUri}`);
      }
    } catch (error) {
      console.error("Error al generar el documento:", error);
      Alert.alert("Error", `Ocurrió un error al generar o compartir el documento: ${error.message}`);
    }
  };
  
  

  render() {
    const { imageUri, description, error, disableTakePhoto, disableOpenGallery, isModalVisible, projectName } = this.state;

    return (
      <View style={styles.container}>
        <Modal visible={isModalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nombre clave del proyecto</Text>
            <Text style={styles.modal}>El nombre clave del proyecto servirá para identificar las imágenes 
                                            en la base de datos. Procura que sea breve.</Text>
            <Text style={styles.modalTitle}></Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ingrese el nombre del proyecto"
              value={projectName}
              onChangeText={(text) => this.setState({ projectName: text })}
            />
            <TouchableOpacity style={styles.modalButton} onPress={this.closeModal}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Text style={styles.title}>Bienvenido a {projectName}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>No hay imagen seleccionada</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Ingrese una descripción"
          value={description}
          onChangeText={(text) => this.setState({ description: text })}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, disableTakePhoto && styles.disabledButton]}
            onPress={this.takePhoto}
            disabled={disableTakePhoto}
          >
            <Text style={styles.buttonText}>Tomar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, disableOpenGallery && styles.disabledButton]}
            onPress={this.openGallery}
            disabled={disableOpenGallery}
          >
            <Text style={styles.buttonText}>Abrir Galería</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={this.handleUpload}>
          <Text style={styles.uploadButtonText}>Subir Imagen y Descripción</Text>
        </TouchableOpacity>
        {this.state.isAdmin && (
        <TouchableOpacity style={styles.generateButton} onPress={this.handleGenerateDocument}>
          <Text style={styles.generateButtonText}>Generar Documento PDF</Text>
        </TouchableOpacity>
      )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#e0f7fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 18,
    marginBottom: 16,
    color: "#888",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: "#ffc107",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MainScreen;
