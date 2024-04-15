import React, { useState, useContext } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import InputField from '../../components/InputField';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../firebaseConfig';
import { push, ref, set } from 'firebase/database';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../provider/AuthProvider';

const Register = () => {
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'jurcekdavid@gmail.com',
      password: 'david007',
    },
  });
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        const user = userCredential.user;
        const dbRef = ref(db, 'users/' + user.uid);

        const userData = {
          firstName: '',
          lastName: '',
          email: user?.email,
          profileImage: '',
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
        };

        set(dbRef, userData)
          .then(() => {
            Toast.show({
              type: 'success',
              position: 'top',
              topOffset: 60,
              text1: 'Uspešna registracija',
              text2: 'Uspešno ste se registrovali na svoj nalog.',
            });
            setLoading(false);
            setUser('onBoarding');
          })
          .catch((error) => {
            console.log('Error:', error.message);
            setLoading(false);
            Toast.show({
              type: 'error',
              position: 'top',
              topOffset: 60,
              text1: 'Greška',
              text2: 'Greška prilikom registracije.',
            });
            setUser('false');
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
    <KeyboardAvoidingView
      behavior='height'
      enabled
      style={{ flex: 1, backgroundColor: '#fafafa' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
        scrollEnabled={false}
      >
        <View
          style={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingBottom: 20,
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 40 }}>
            Registracija
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

          <InputField
            control={control}
            errors={errors}
            label='Password'
            name='password'
            defaultValue=''
            rules={{
              required: 'Šifra je obavezna.',
              minLength: {
                value: 6,
                message: 'Šifra mora imati najmanje 6 karaktera',
              },
            }}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
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
            <Text style={{ color: '#0C0C0C', fontSize: 12 }}>
              Imate nalog?{' '}
            </Text>
            <Text
              style={{ color: '#1E4DEA', fontWeight: 'bold', fontSize: 12 }}
            >
              Ulogujte se
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
});

export default Register;
