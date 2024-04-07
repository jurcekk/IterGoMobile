import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import InputField from '../components/InputField';
import { AntDesign } from '@expo/vector-icons';
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
  FIREBASE_STORAGE,
} from '../../firebaseConfig';
import { ref, get, update, remove, set } from 'firebase/database';
import {
  updatePassword,
  deleteUser,
  updateEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../provider/AuthProvider';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  deleteObject,
  ref as refStorage,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

const EditProfile = () => {
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { userData, setUserData } = useContext(AuthContext);

  const [profileImage, setProfileImage] = useState(userData?.profileImage);

  const navigation = useNavigation();

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;
  const storage = FIREBASE_STORAGE;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useForm({
    defaultValues: {
      profileImage: userData.profileImage,
      firstName: userData.firstName.toString(),
      lastName: userData.lastName.toString(),
      email: userData.email.toString(),
      password: '',
      passwordRepeat: '',
    },
  });

  const password = useRef({});
  password.current = watch('password', '');

  const getUserData = () => {
    const dbRef = ref(db, 'users/' + auth.currentUser.uid);
    get(dbRef).then((snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const user = snapshot.val();
      setData(user);
    });
  };

  const uploadImage = async (uri) => {
    setUploading(true);

    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf('/') + 1);

    const storageRef = refStorage(storage, 'images/' + filename);

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
          resolve(url);
        }
      );
    });
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

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (data.password !== '') {
        console.log('CHANGE PASSWORD');
        updatePassword(auth.currentUser, data.password).then(() => {
          Toast.show({
            type: 'success',
            position: 'top',
            topOffset: 60,
            text1: 'Uspešna izmena',
            text2: 'Uspešno ste izmenili šifru.',
          });
          console.log('Password updated');
        });
      } else if (data.email !== auth.currentUser.email && data.email !== '') {
        console.log('CHANGE EMAIL');

        updateEmail(auth.currentUser, data.email).then(() => {
          console.log('Email updated');
          Toast.show({
            type: 'success',
            position: 'top',
            topOffset: 60,
            text1: 'Uspešna izmena',
            text2: 'Uspešno ste izmenili email adresu.',
          });
          setUserData({ ...userData, email: data.email });
        });
      } else if (
        data.firstName !== userData.firstName ||
        data.lastName !== userData.lastName
      ) {
        if (data.firstName === '') {
          setError('firstName', {
            type: 'required',
            message: 'Ime je obavezno.',
          });
          return;
        } else if (data.lastName === '') {
          setError('lastName', {
            type: 'required',
            message: 'Prezime je obavezno.',
          });
          return;
        }

        console.log('CHANGE NAME');

        updateProfile(auth.currentUser, {
          displayName: `${data.firstName} ${data.lastName}`,
        }).then(() => {
          console.log('Name updated', auth.currentUser.displayName);

          update(ref(db, 'users/' + auth.currentUser.uid), {
            firstName: data.firstName,
            lastName: data.lastName,
          }).then(() => {
            console.log('Name updated in database');
            Toast.show({
              type: 'success',
              position: 'top',
              topOffset: 60,
              text1: 'Uspešna izmena',
              text2: 'Uspešno ste izmenili ime i prezime.',
            });
            setUserData({
              ...userData,
              firstName: data.firstName,
              lastName: data.lastName,
            });
          });
        });
      } else if (data.profileImage !== userData.profileImage) {
        console.log('CHANGE PROFILE IMAGE');

        const imageName = decodeURIComponent(
          userData.profileImage.split('/')[7].split('?')[0]
        );

        const oldImageRef = refStorage(storage, imageName);
        deleteObject(oldImageRef)
          .then(async () => {
            console.log('Old image deleted');
            const url = await uploadImage(data.profileImage);
            console.log('URL', url);

            updateProfile(auth.currentUser, {
              photoURL: url,
            })
              .then(() => {
                console.log('Profile image updated', auth.currentUser.photoURL);

                set(ref(db, 'users/' + auth.currentUser.uid), {
                  ...userData,
                  profileImage: url,
                }).then(() => {
                  console.log('Profile image updated in database');
                  Toast.show({
                    type: 'success',
                    position: 'top',
                    topOffset: 60,
                    text1: 'Uspešna izmena',
                    text2: 'Uspešno ste izmenili profilnu sliku.',
                  });
                  setUserData({ ...userData, profileImage: url });
                });
              })
              .catch((error) => {
                console.log('Error updating profile image:', error);
              });
          })
          .catch((error) => {
            console.log('Error deleting old image:', error);
          });
      }
    } catch (error) {
      console.log('Error creating user:', error.message);
      Toast.show({
        type: 'error',
        position: 'top',
        topOffset: 60,
        text1: 'Greška',
        text2: 'Greška prilikom izmene.',
      });
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <AntDesign name='leftcircle' size={25} color='#ff6e2a' />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          Uređivanje profila
        </Text>
      </View>
      <KeyboardAvoidingView behavior='height' enabled style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
            paddingHorizontal: 40,
          }}
        >
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
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Ime i prezime
          </Text>
          <InputField
            control={control}
            errors={errors}
            label='Ime'
            name='firstName'
            rules={{ required: 'Ime je obavezno.' }}
          />

          <InputField
            control={control}
            errors={errors}
            label='Prezime'
            name='lastName'
            rules={{ required: 'Ime je obavezno.' }}
          />

          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Mejl adresa
          </Text>
          <InputField
            control={control}
            errors={errors}
            label='Email'
            name='email'
            type='email-address'
            defaultValue=''
            rules={{
              required: 'Email je obavezan',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ne ispravna email adresa',
              },
            }}
          />

          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Šifra
          </Text>
          <InputField
            control={control}
            errors={errors}
            label='Šifra'
            name='password'
            defaultValue=''
            rules={{
              minLength: {
                value: 6,
                message: 'Šifra mora imati najmanje 6 karaktera',
              },
            }}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          <InputField
            control={control}
            errors={errors}
            label='Ponovite šifru'
            name='passwordRepeat'
            defaultValue=''
            rules={{
              validate: (value) =>
                value === password.current || 'Šifre se ne poklapaju.',
            }}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: '#fafafa' }]}
            onPress={() => {
              Alert.alert(
                'Brisanje naloga',
                'Da li ste sigurni da želite da obrišete nalog?',
                [
                  {
                    text: 'Odustani',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Obriši',
                    onPress: async () => {
                      await remove(ref(db, 'users/' + auth.currentUser.uid));

                      deleteUser(auth.currentUser)
                        .then(() => {
                          console.log('User deleted');
                        })
                        .catch((error) => {
                          console.log('Error deleting user:', error);
                        });
                    },
                  },
                ],
                { cancelable: false }
              );
            }}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>
              Obrišite profil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: '#fafafa' }]}
            onPress={() => {
              Alert.alert(
                'Odjava',
                'Da li ste sigurni da želite da se odjavite?',
                [
                  {
                    text: 'Odustani',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Odjavi se',
                    onPress: () => {
                      signOut(auth)
                        .then(() => {
                          console.log('User signed out!');
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    },
                  },
                ],
                { cancelable: false }
              );
            }}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>
              Izlogujte se
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <View
        style={{
          width: '100%',
          paddingHorizontal: 30,
        }}
      >
        <TouchableOpacity
          style={{
            width: '100%',
            height: 50,
            backgroundColor: '#ff6e2a',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            marginTop: 20,
          }}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={{ color: '#fafafa', fontWeight: 'bold' }}>
            Izmenite profil
          </Text>
          {loading && uploading && (
            <ActivityIndicator size='small' color='#fafafa' style={{}} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,

    // marginBottom: 50,
  },

  input: {
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    height: 50,
    width: '100%',
    marginBottom: 8,
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    elevation: 2,
    paddingLeft: 15,
  },

  errorText: {
    color: 'red',
    marginBottom: 4,
    fontSize: 12,
  },

  loginButton: {
    backgroundColor: '#ff6e2a',
    height: 50,
    paddingHorizontal: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },

  header: {
    width: '100%',
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30,
  },

  backButton: {
    zIndex: 1,
    elevation: 1,
  },

  editProfileButton: {
    borderRadius: 30,
    backgroundColor: '#ff6e2a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingHorizontal: 15,
  },

  editProfileText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fafafa',
  },
});

export default EditProfile;
