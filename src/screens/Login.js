import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import InputField from '../components/InputField';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [showPassword, setShowPassword] = useState(true);
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    try {
      alert('Login successful!');
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 40 }}>
        Prijava
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
          required: 'Email je obavezan.',
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
      {/* {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )} */}

      <TouchableOpacity
        style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: 30 }}
        onPress={() => alert('Šifra zaboravljena?')}
      >
        <Text style={{ color: '#0C0C0C', fontSize: 12 }}>
          Zaboravljena šifra?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={{ color: '#0C0C0C', fontWeight: 'bold' }}>Prijavi se</Text>
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
        <Text style={{ color: '#0C0C0C', fontSize: 12 }}>Nemate nalog? </Text>
        <Text style={{ color: '#1E4DEA', fontWeight: 'bold', fontSize: 12 }}>
          Registrujte se
        </Text>
      </TouchableOpacity>
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

export default Login;
