import { ref, set, get } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import InputField from '../components/InputField';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

const BecomeDriver = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [carBrands, setCarBrands] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const carBrand = watch('carBrand', '');

  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  const getCarBrands = () => {
    const dbRef = ref(db, 'carBrands');
    get(dbRef, (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const data = snapshot.val();
      setCarBrands(data);
    });
  };

  const handleInviteCodeChange = (text) => {
    setInviteCode(text);
  };

  const handleNextPress = () => {
    if (inviteCode === '') {
      Alert.alert(
        'Pozivni kod',
        'Pozivni kod je obavezan.',
        [
          {
            text: 'OK',
            onPress: () => console.log('OK pressed'),
          },
        ],
        { cancelable: false }
      );
      return;
    }

    const dbRef = ref(db, 'inviteCodes');
    get(dbRef, (snapshot) => {
      if (!snapshot.exists()) {
        Alert.alert(
          'Pozivni kod',
          'Pozivni kod nije ispravan.',
          [
            {
              text: 'OK',
              onPress: () => console.log('OK pressed'),
            },
          ],
          { cancelable: false }
        );
        return;
      }

      const data = snapshot.val();

      Object.entries(data).forEach(([key, value]) => {
   

        if (value.code === inviteCode && value.isActive) {
          console.log('Invite code found:', value);

          // Set invite code to inactive
          set(ref(db, 'inviteCodes/' + key + '/isActive'), false)
            .then(() => {
              console.log('Invite code set to inactive');
            })
            .catch(() => {
              console.log('Error setting invite code to inactive:');
            });

          setIsModalVisible(true);
        }
      });
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSavePress = (data) => {
    console.log('Driver information saved:', data);

    // get user data from Firebase database
    const dbRef = ref(db, 'users/' + auth.currentUser.uid);
    get(dbRef, (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const user = snapshot.val();

      set(ref(db, 'users/' + auth.currentUser.uid), {
        ...user,
        firstName: user.firstName,
        lastName: user.lastName,
        email: auth.currentUser.email,
        role: 'driver',
        telNumber: data.telNumber,
        vehicleColor: data.vehicleColor,
        regPlate: data.regPlate,
        carBrand: data.carBrand,
        yearOfProduction: data.yearOfProduction,
      })
        .then(() => {
          console.log('User stored in database');
          navigation.navigate('Home');
          setIsModalVisible(false);
        })
        .catch(() => {
          console.log('Error storing user in database:');
        });
    });
  };

  useEffect(() => {
    getCarBrands();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <AntDesign name='leftcircle' size={25} color='#ff6e2a' />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 1,
        }}
      >
        <KeyboardAvoidingView
          behavior='padding'
          style={{
            flex: 1,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: 'bold',
              marginBottom: 40,
              textAlign: 'center',
              marginTop: 40,
            }}
          >
            Postani vozač
          </Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 7 }}>
            Unesite pozivni kod
          </Text>
          <Text style={{ fontSize: 17, marginBottom: 50 }}>
            Unesite kod kako bi ste postali vozač.
          </Text>

          <TextInput
            style={styles.input}
            placeholder='Enter invite code'
            value={inviteCode}
            onChangeText={handleInviteCodeChange}
          />

          <TouchableOpacity
            style={{
              paddingVertical: 10,
              marginTop: 5,
            }}
            onPress={() => {
              Alert.alert(
                'Pozivni kod',
                'Pozivni kod dobijate od nekog od naših admina.',
                [
                  {
                    text: 'OK',
                    onPress: () => console.log('OK pressed'),
                  },
                ],
                { cancelable: false }
              );
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>Kako dobiti pozivni kod?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#ff6e2a',
              paddingVertical: 10,
              marginTop: 50,
              borderRadius: 30,
              marginHorizontal: 40,
            }}
            onPress={handleNextPress}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Dalje
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>

      <Modal visible={isModalVisible} onRequestClose={handleModalClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.label}>Broj telefona:</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Broj telefona'
                type='phone-pad'
                name='telNumber'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='telNumber'
            rules={{
              required: 'Broj telefona je obavezan.',
              pattern: {
                value: /^\d{3}\d{3}\d{4}$/,
                message: 'Ne ispravan broj telefona.',
              },
            }}
            defaultValue=''
          />

          <Text style={styles.label}>Podaci o autu:</Text>
          <Text
            style={{
              fontSize: 12,
              marginBottom: 5,
              color: '#0C0C0C',
            }}
          >
            Boja vozila
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Boja vozila'
                type='default'
                name='vehicleColor'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='vehicleColor'
            rules={{
              required: 'Boja kola je obavezna.',
            }}
            defaultValue=''
          />
          <Text
            style={{
              fontSize: 12,
              marginBottom: 5,
              color: '#0C0C0C',
            }}
          >
            Registarska oznaka
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Registarska oznaka'
                type='default'
                name='regPlate'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='regPlate'
            rules={{
              required: 'Registarska oznaka je obavezna.',
              // Check if reg plate is in the list of reg plates
              pattern: {
                value: /^[A-Z]{2}\d{3,5}[A-Z]{2}$/,
                message: 'Neispravna registarska oznaka.',
              },
            }}
            defaultValue=''
          />
          <Text
            style={{
              fontSize: 12,
              marginBottom: 5,
              color: '#0C0C0C',
            }}
          >
            Model Auta
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Model auta'
                type='default'
                name='carBrand'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='carBrand'
            rules={{
              required: 'Model auta je obavezan.',
              // Check if car brand is in the list of car brands
              validate: (value) =>
                (carBrands && carBrands.includes(value) === true) ||
                'Model auta nije tačan.',
            }}
            defaultValue=''
          />
          <Text
            style={{
              fontSize: 12,
              marginBottom: 5,
              color: '#0C0C0C',
            }}
          >
            Godina proizvodnje
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Godina proizvodnje'
                type='default'
                name='yearOfProduction'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                errors={errors}
              />
            )}
            name='yearOfProduction'
            rules={{
              required: 'Godina proizvodnje je obavezna.',
              pattern: {
                value: /^\d{4}$/,
                message: 'Neispravna godina proizvodnje.',
              },
            }}
            defaultValue=''
          />

          <TouchableOpacity
            style={{
              backgroundColor: '#ff6e2a',
              paddingVertical: 10,
              marginTop: 30,
              borderRadius: 30,
              marginHorizontal: 40,
            }}
            onPress={handleSubmit(handleSavePress)}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Sačuvaj
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },

  input: {
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 50,
    width: '100%',
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

  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },

  header: {
    width: '100%',
    height: 60,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    fontSize: 20,
  },

  backButton: {
    zIndex: 1,
    elevation: 1,
  },
});

export default BecomeDriver;
