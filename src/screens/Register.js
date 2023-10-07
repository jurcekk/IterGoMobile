import React, { useState, useRef } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import InputField from '../components/InputField';

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
      lastName: 'Jurčević',
      password: '123456',
      passwordRepeat: '123456',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const password = useRef({});
  password.current = watch('password', '');

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      Alert.alert('Registracija uspješna');
    } catch (error) {
      console.log('Error creating user:', error.message);
    } finally {
      setLoading(false);
    }
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
          rules={{
            required: 'Prezime je obavezno.',
          }}
          defaultValue=''
        />
        {/* {errors.lastName && (
        <Text style={styles.errorText}>{errors.lastName.message}</Text>
      )} */}

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
        {/* {errors.passwordRepeat && (
        <Text style={styles.errorText}>{errors.passwordRepeat.message}</Text>
      )} */}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={{ color: '#0C0C0C', fontWeight: 'bold' }}>
            Registrujte se
          </Text>
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
    marginTop: 20,
  },
});

export default Register;
