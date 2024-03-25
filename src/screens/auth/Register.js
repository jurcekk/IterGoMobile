import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import InputField from '../../components/InputField';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../firebaseConfig';
import { ref, set } from 'firebase/database';
import { updateProfile } from 'firebase/auth';
import Toast from 'react-native-toast-message';

const Register = () => {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      firstName: 'David',
      lastName: 'Jurcek',
      email: 'jurcekdavid@gmail.com',
      password: 'david007',
      passwordRepeat: 'david007',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const password = useRef({});

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;
  password.current = watch('password', '');

  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // console.log('User:', JSON.stringify(user, null, 2));
        updateProfile(auth.currentUser, {
          displayName: `${data.firstName} ${data.lastName}`,
        })
          .then(() => {
            console.log('User profile updated');
            console.log(auth.currentUser.displayName);
            set(ref(db, 'users/' + user?.uid), {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              role: 'user',
              location: {
                latitude: 0,
                longitude: 0,
              },
              phone: '',
              vehicle: {
                model: '',
                year: '',
                color: '',
                licencePlate: '',
              },
            })
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
          })
          .catch((error) => {
            console.log(error);
            Toast.show({
              type: 'error',
              position: 'top',
              topOffset: 60,
              text1: 'Greška',
              text2: 'Greška prilikom registracije.',
            });
          });
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log('Error:', errorMessage);
        setLoading(false);
        Toast.show({
          type: 'error',
          position: 'top',
          topOffset: 60,
          text1: 'Greška',
          text2: 'Greška prilikom registracije.',
        });
      });
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 40 }}>
        Registracija
      </Text>
      <KeyboardAvoidingView behavior='padding'>
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
          rules={{
            required: 'Ime je obavezno.',
          }}
          defaultValue=''
        />

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
          rules={{
            required: 'Prezime je obavezno.',
          }}
          defaultValue=''
        />

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
            required: 'Email je obavezan.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Ne ispravna email adresa.',
            },
          }}
          defaultValue=''
        />

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
          rules={{ required: 'Šifra je obavezna.' }}
          defaultValue=''
        />

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
            required: 'Šifra je obavezna.',
            validate: (value) =>
              value === password.current || 'Šifre se ne poklapaju.',
          }}
          defaultValue=''
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={{ color: '#0C0C0C', fontWeight: 'bold' }}>
            Registrujte se
          </Text>
          {loading && <ActivityIndicator size='small' color='#0C0C0C' />}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            marginTop: 50,
            marginBottom: 30,
          }}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: '#0C0C0C', fontSize: 12 }}>Imate nalog? </Text>
          <Text style={{ color: '#1E4DEA', fontWeight: 'bold', fontSize: 12 }}>
            Ulogujte se
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
});

export default Register;
