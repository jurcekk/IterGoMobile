import React, { useEffect, useContext } from 'react';
import { View, Text, Button } from 'react-native';
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useForm } from 'react-hook-form';
import InputField from '../../components/InputField';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../firebaseConfig';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../provider/AuthProvider';
import { update } from 'firebase/database';

const Second = () => {
  const [confirm, setConfirm] = useState(null);
  const { userData } = useContext(AuthContext);

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      verificationCode: '',
    },
  });

  const veryfiyPhoneNumber = async (phoneNumber) => {
    try {
      const confirmation = await auth.verifyPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.log('Phone verification error:', error);
    }
  };

  const onSubmit = async (data) => {
    console.log('Phone number:', data);
    try {
      const credential = auth.PhoneAuthProvider.credential(
        confirm.verificationId,
        data.verificationCode
      );
      const userData = await auth.currentUser.linkWithCredential(credential);
      console.log(userData);

      const dbRef = ref(db, 'users/' + userData.user.uid);
      update(dbRef, {
        isPhoneVerified: true,
      });
    } catch (error) {
      if (error.code == 'auth/invalid-verification-code') {
        Toast.show({
          type: 'error',
          position: 'top',
          topOffset: 60,
          text1: 'Greška',
          text2: 'Neispravan kod za verifikaciju.',
        });
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          topOffset: 60,
          text1: 'Greška',
          text2: 'Došlo je do greške prilikom verifikacije broja telefona.',
        });
      }
    }
  };

  useEffect(() => {
    if (!userData?.phone) return;

    veryfiyPhoneNumber(`+381${userData?.phone.toString().substring(1)}`);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifikacija Broja telefona</Text>
      <InputField
        control={control}
        errors={errors}
        label='Kod za verifikaciju'
        name='verificationCode'
        rules={{ required: 'Kod je obavezan.' }}
      />
      <Button title='Submit' onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
};

export default Second;
