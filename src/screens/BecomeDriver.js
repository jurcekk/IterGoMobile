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
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { ref, set, get, update } from 'firebase/database';
import { BlurView } from 'expo-blur';

const BecomeDriver = () => {
  const [inviteCode, setInviteCode] = useState('12345');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [carBrands, setCarBrands] = useState(null);
  const [carBrandModal, setCarBrandModal] = useState(false);
  const [selectCarBrand, setSelectCarBrand] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      carBrand: '',
    },
  });
  function open() {
    carBrandModal ? setCarBrandModal(false) : setCarBrandModal(true);
  }

  function close() {
    setCarBrandModal(false);
  }

  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  const getCarBrands = () => {
    const dbRef = ref(db, 'carBrands');
    get(dbRef).then((snapshot) => {
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

  const handleNextPress = async () => {
    if (inviteCode === '') {
      Toast.show({
        type: 'error',
        position: 'top',
        topOffset: 60,
        text1: 'Pozivni kod',
        text2: 'Pozivni kod je obavezan.',
      });
      return;
    }
    const dbRef = ref(db, 'inviteCodes');
    console.log('Invite code:', dbRef);

    get(dbRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          Toast.show({
            type: 'error',
            position: 'top',
            topOffset: 60,
            text1: 'Pozivni kod',
            text2: 'Pozivni kod nije ispravan.',
          });
          return;
        }

        const data = snapshot.val();
        Object.entries(data).forEach(([key, value]) => {
          console.log('Key:', value);
          if (value.code === inviteCode && value.isActive) {
            // Set invite code to inactive
            set(ref(db, 'inviteCodes/' + key + '/isActive'), false)
              .then(() => {
                console.log('Invite code set to inactive');
              })
              .catch(() => {
                console.log('Error setting invite code to inactive:');
              });

            setIsModalVisible(true);
          } else if (value.code === inviteCode && !value.isActive) {
            Toast.show({
              type: 'error',
              position: 'top',
              topOffset: 60,
              text1: 'Pozivni kod',
              text2: 'Pozivni kod je već iskorišćen.',
            });
          }
        });
      })
      .catch(() => {
        console.log('Error getting invite code:');
      });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSavePress = (data) => {
    console.log('Car brand is required', data);

    if (data.carBrand === '') {
      setError('carBrand', {
        type: 'required',
        message: 'Model auta je obavezan.',
      });
      return;
    } else {
      clearErrors('carBrand');
    }

    console.log('Driver information saved:', data);

    const dbRef = ref(db, 'users/' + auth.currentUser.uid);
    get(dbRef).then((snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const user = snapshot.val();

      update(ref(db, 'users/' + auth.currentUser.uid), {
        role: 'driver',
        vehicle: {
          color: data.vehicleColor,
          licencePlate: data.regPlate,
          model: data.carBrand,
          year: data.yearOfProduction,
        },
        phone: data.telNumber,
      })
        .then(() => {
          console.log('User stored in database');
          Toast.show({
            type: 'success',
            position: 'top',
            topOffset: 60,
            text1: 'Uspešno postali vozač',
            text2: 'Uspešno ste postali vozač.',
          });

          setIsModalVisible(false);
          navigation.navigate('Home');
        })
        .catch(() => {
          console.log('Error storing user in database:');
          setIsModalVisible(false);
          Toast.show({
            type: 'error',
            position: 'top',
            topOffset: 60,
            text1: 'Greška',
            text2: 'Greška prilikom postavljanja vozača.',
          });
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
          onPress={() => {
            setIsModalVisible(false);
            navigation.goBack();
          }}
        >
          <AntDesign
            name='leftcircle'
            size={25}
            color='#ff6e2a'
            style={{
              zIndex: 1,
              elevation: 1,
            }}
          />
        </TouchableOpacity>
      </View>
      {!isModalVisible ? (
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
              <Text style={{ fontWeight: 'bold' }}>
                Kako dobiti pozivni kod?
              </Text>
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
      ) : (
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
                value: /^06\d{8}$/,
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
          <TouchableOpacity
            style={{
              backgroundColor: '#F2F2F2',
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
              marginBottom: 10,
            }}
            onPress={open}
          >
            <Text
              style={{
                flex: 1,
                color: '#0C0C0C',
                alignSelf: 'center',
              }}
            >
              {selectCarBrand ? selectCarBrand : 'Izaberite model auta'}
            </Text>
            <AntDesign
              name='down'
              size={16}
              color='#0C0C0C'
              style={{
                alignSelf: 'center',
                marginRight: 10,
              }}
            />
          </TouchableOpacity>
          {errors['carBrand'] && (
            <Text style={styles.errorText}>{errors['carBrand'].message}</Text>
          )}

          <Modal visible={carBrandModal} transparent={true}>
            <BlurView
              intensity={100}
              style={{
                flex: 1,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Picker
                style={{
                  width: '100%',
                  elevation: 2,
                }}
                selectedValue={selectCarBrand}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectCarBrand(itemValue);
                  setValue('carBrand', itemValue);
                  clearErrors('carBrand');
                }}
              >
                <Picker.Item label='Izaberite model auta' value='' />
                {carBrands &&
                  carBrands.map((item, index) => {
                    return (
                      <Picker.Item label={item} value={item} key={index} />
                    );
                  })}
              </Picker>
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    marginTop: 30,
                    borderRadius: 30,
                    marginHorizontal: 40,
                  }}
                  onPress={close}
                >
                  <Text
                    style={{
                      color: '#0C0C0C',
                      fontSize: 20,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    Sačuvaj
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    marginTop: 30,
                    borderRadius: 30,
                    marginHorizontal: 40,
                  }}
                  onPress={() => {
                    setSelectCarBrand('');
                    setValue('carBrand', '');
                    clearErrors('carBrand');
                    close();
                  }}
                >
                  <Text
                    style={{
                      color: '#0C0C0C',
                      fontSize: 20,
                      textAlign: 'center',
                    }}
                  >
                    Izađi
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Modal>
          {/* <Controller
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
            }}
            defaultValue=''
          /> */}
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#fafafa',
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

  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
  },
});

export default BecomeDriver;
