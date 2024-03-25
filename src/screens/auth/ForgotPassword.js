import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import InputField from '../../components/InputField';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Toast from 'react-native-toast-message';

const ForgotPassword = () => {
  const auth = FIREBASE_AUTH;

  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: 'jurcekdavid@gmail.com' },
  });

  const onSubmit = async (data) => {
    sendPasswordResetEmail(auth, data.email)
      .then(() => {
        Toast.show({
          type: 'success',
          position: 'top',
          topOffset: 60,
          text1: 'Email',
          text2: 'Poslali smo vam email za resetiranje šifre.',
        });
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          position: 'top',
          topOffset: 60,
          text1: 'Greška',
          text2:
            'Dogodila se greška prilikom slanja emaila za restartovanje šifre.',
        });
      });
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 40 }}>
        Zaboravljena šifra
      </Text>
      <KeyboardAvoidingView behavior='padding'>
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
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 8,
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={{ color: '#0C0C0C', fontWeight: 'bold' }}>
              Pošalji email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: '#1E4DEA', fontWeight: 'bold' }}>
              Vrati se na prijavu
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 50,
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
    borderRadius: 10,
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

export default ForgotPassword;
