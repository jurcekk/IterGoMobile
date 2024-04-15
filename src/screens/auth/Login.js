import React, { useState, useContext } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import InputField from '../../components/InputField';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../provider/AuthProvider';

const Login = () => {
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const auth = FIREBASE_AUTH;

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

  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);

    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Login successful
        setLoading(false);
        Toast.show({
          type: 'success',
          position: 'top',
          topOffset: 60,
          text1: 'Uspešna prijava',
          text2: 'Uspešno ste se prijavili na svoj nalog.',
        });
        setUser('true');
      })
      .catch((error) => {
        // Login failed
        setLoading(false);
        console.log('Login error:', error.message);
        const message =
          error.code === 'auth/invalid-credential'
            ? 'Neispravni podaci za prijavu.'
            : error.message;

        Toast.show({
          type: 'error',
          position: 'top',
          topOffset: 60,
          text1: 'Greška',
          text2: message,
        });
        setUser('false');
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
            Prijava
          </Text>
          <InputField
            control={control}
            errors={errors}
            label='Email'
            name='email'
            type='email-address'
            defaultValue=''
            rules={{
              required: 'Email je obavezan.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ne ispravna email adresa.',
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
            style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: 30 }}
            onPress={() => {
              navigation.navigate('ForgotPassword');
            }}
          >
            <Text style={{ color: '#0C0C0C', fontSize: 12 }}>
              Zaboravljena šifra?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={{ color: '#0C0C0C', fontWeight: 'bold' }}>
              Prijavi se
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
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={{ color: '#0C0C0C', fontSize: 12 }}>
              Nemate nalog?{' '}
            </Text>
            <Text
              style={{ color: '#1E4DEA', fontWeight: 'bold', fontSize: 12 }}
            >
              Registrujte se
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
    marginBottom: 50,
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
    flexDirection: 'row',
    gap: 10,
  },

  showPassword: {
    position: 'absolute',
    right: '3%',
    alignSelf: 'center',
    padding: 5,
    zIndex: 1000,
    elevation: 1000,
  },
});

export default Login;
