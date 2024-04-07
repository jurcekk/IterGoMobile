import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Keyboard,
} from 'react-native';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import InputField from '../../components/InputField';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  FIREBASE_STORAGE,
  FIREBASE_DB,
  FIREBASE_AUTH,
} from '../../../firebaseConfig';
import Toast from 'react-native-toast-message';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ref as refDB, set, update } from 'firebase/database';
import { AuthContext } from '../../provider/AuthProvider';
import { useNavigation } from '@react-navigation/native';

const First = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: 'David',
      lastName: 'Jurcek',
      email: '',
      phoneNumber: '0617223626',
      profileImage: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const { userData } = useContext(AuthContext);

  const navigation = useNavigation();
  const storage = FIREBASE_STORAGE;
  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;

  if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Početni ekran</Text>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>
          Potrebno je dozvoliti pristup kameri kako bi mogli pristupiti.
        </Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={{ color: '#0C0C0C', fontWeight: 'bold' }}>
            Dozvoli pristup
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const uploadImage = async (uri) => {
    setUploading(true);

    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf('/') + 1);

    const storageRef = ref(storage, 'images/' + filename);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          console.log('Error uploading image:', error);
          setUploading(false);
          Toast.show({
            type: 'error',
            position: 'top',
            topOffset: 60,
            text1: 'Greška',
            text2: 'Greška prilikom slanja slike.',
          });
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', url);
          setUploading(false);
          // navigation.navigate('Home');
          resolve(url);
        }
      );
    });
  };

  const onSubmit = async (data) => {
    // Update user data in database firebase
    let url = null;
    const user = auth?.currentUser;
    setLoading(true);
    if (profileImage) {
      url = await uploadImage(profileImage);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Greška',
        text2: 'Morate izabrati profilnu sliku.',
      });
      setLoading(false);

      return;
    }
    console.log(user);
    const obj = {
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: userData?.email,
      profileImage: url,
      role: 'user',
      location: {
        latitude: 0,
        longitude: 0,
      },
      phone: data?.phoneNumber,
      vehicle: {
        model: '',
        year: '',
        color: '',
        licencePlate: '',
      },
    };

    update(refDB(db, 'users/' + user?.uid), obj)
      .then(() => {
        console.log('User stored in database');
        setLoading(false);
        Toast.show({
          type: 'success',
          position: 'top',
          topOffset: 60,
          text1: 'Uspešna registracija',
          text2: 'Uspešno ste se registrovali.',
        });
      })
      .catch((error) => {
        console.log('Error storing user in database:', error);
        setLoading(false);
        Toast.show({
          type: 'error',
          position: 'top',
          topOffset: 60,
          text1: 'Greška',
          text2: 'Greška prilikom registracije.',
        });
      });

    // updateProfile(auth.currentUser, {
    //   displayName: `${data.firstName} ${data.lastName}`,
    // })
    //   .then(() => {
    //     console.log('User profile updated');
    //     console.log(auth.currentUser.displayName);

    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     Toast.show({
    //       type: 'error',
    //       position: 'top',
    //       topOffset: 60,
    //       text1: 'Greška',
    //       text2: 'Greška prilikom registracije.',
    //     });
    //   });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setValue('profileImage', result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
      console.log(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior='height'
      enabled
      style={{ flex: 1, backgroundColor: '#fafafa' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        scrollEnabled={false}
      >
        <Pressable
          style={styles.container}
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: 20 }}>Početni ekran</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                alignSelf: 'center',
                marginRight: 15,
              }}
            >
              Profilna Slika:
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              style={[
                styles.imagePicker,
                !profileImage && {
                  padding: 40,
                },
              ]}
            >
              {profileImage ? (
                <Image
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 50,
                    backgroundColor: '#f0f0f0',
                  }}
                  source={profileImage}
                  contentFit='cover'
                  transition={500}
                />
              ) : (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome5 name='plus' size={25} color='#0C0C0C80' />
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 10,
              alignSelf: 'flex-start',
            }}
          >
            Ime
          </Text>
          <InputField
            control={control}
            errors={errors}
            label='Ime'
            name='firstName'
            rules={{ required: 'Ime je obavezno.' }}
          />
          <Text
            style={{
              fontSize: 16,
              marginBottom: 10,
              alignSelf: 'flex-start',
            }}
          >
            Prezime
          </Text>
          <InputField
            control={control}
            errors={errors}
            label='Prezime'
            name='lastName'
            rules={{ required: 'Prezime je obavezno.' }}
          />
          <Text
            style={{
              fontSize: 16,
              marginBottom: 10,
              alignSelf: 'flex-start',
            }}
          >
            Broj telefona
          </Text>
          <InputField
            control={control}
            errors={errors}
            label='Broj Telefona'
            name='phoneNumber'
            type='phone-pad'
            rules={{
              required: 'Broj telefona je obavezan.',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Broj telefona nije ispravan.',
              },
            }}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={{ color: '#0C0C0C', fontWeight: 'bold' }}>
              Prijavi se
            </Text>
            {loading && uploading && (
              <ActivityIndicator size='small' color='#0C0C0C' />
            )}
          </TouchableOpacity>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    backgroundColor: '#fafafa',
  },

  imagePicker: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    elevation: 2,
    marginBottom: 10,
  },

  button: {
    height: 50,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
  },

  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
});

export default First;
