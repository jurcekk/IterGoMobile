import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import InputField from '../components/InputField';
import { AntDesign } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { ref, get, update, remove } from 'firebase/database';
import {
  updatePassword,
  deleteUser,
  updateEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import Toast from 'react-native-toast-message';

const EditProfile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const navigation = useNavigation();

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      firstName: auth.currentUser.displayName.split(' ')[0].toString(),
      lastName: auth.currentUser.displayName.split(' ')[1].toString(),
      email: auth.currentUser.email.toString(),
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
        });
      } else if (
        data.firstName !==
          auth.currentUser.displayName.split(' ')[0].toString() ||
        data.lastName !== auth.currentUser.displayName.split(' ')[1].toString()
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
          });
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
      <ScrollView
        style={{
          width: '100%',
          height: '100%',
          paddingHorizontal: 30,
          paddingVertical: 20,
        }}
      >
        <KeyboardAvoidingView behavior='padding'>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Ime i prezime
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Ime'
                type='default'
                name='firstName'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='firstName'
            defaultValue=''
          />
          {/* {errors.firstName && (
        <Text style={styles.errorText}>{errors.firstName.message}</Text>
      )} */}

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Prezime'
                type='default'
                name='lastName'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='lastName'
            defaultValue=''
          />
          {/* {errors.lastName && (
        <Text style={styles.errorText}>{errors.lastName.message}</Text>
      )} */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Mejl adresa
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Email'
                type='email-address'
                name='email'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='email'
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ne ispravna email adresa.',
              },
            }}
            defaultValue=''
          />
          {/* {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )} */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Šifra
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Šifra'
                type='default'
                name='password'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}
            name='password'
            defaultValue=''
          />
          {/* {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )} */}

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Ponovite šifru'
                type='default'
                name='passwordRepeat'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}
            name='passwordRepeat'
            rules={{
              validate: (value) =>
                value === password.current || 'Šifre se ne poklapaju.',
            }}
            defaultValue=''
          />
          {/* {errors.passwordRepeat && (
        <Text style={styles.errorText}>{errors.passwordRepeat.message}</Text>
      )} */}

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
        </KeyboardAvoidingView>
      </ScrollView>
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
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    // marginBottom: 50,
  },

  input: {
    backgroundColor: 'white',
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
