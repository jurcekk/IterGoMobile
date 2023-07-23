import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Text, View, StyleSheet, Keyboard, ScrollView } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  AnimatedRegion,
} from 'react-native-maps';
import BottomSheet, { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import InputField from '../components/InputField';
import { useForm, Controller } from 'react-hook-form';
import MenuButton from '../components/MenuButton';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const [mapRegion, setmapRegion] = useState({
    latitude: 46.097,
    longitude: 19.6576,
    latitudeDelta: 0.0922 / 4,
    longitudeDelta: 0.0421 / 4,
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigation = useNavigation();

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['35%', '90%'], []);

  const handleClose = useCallback(() => {
    bottomSheetRef.current.close();
    Keyboard.dismiss();
  }, []);

  const handleOpen = useCallback(() => {
    bottomSheetRef.current.snapToIndex(0);
  }, []);

  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleOnBlur = useCallback(() => {
    bottomSheetRef.current.snapToIndex(0);
  }, []);

  const handleOnFocus = useCallback(() => {
    bottomSheetRef.current.snapToPosition('50%');
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        onPress={handleClose}
      >
        <Marker coordinate={mapRegion} title='Marker' onPress={handleOpen} />
      </MapView>

      <View
        style={{
          position: 'absolute',
          bottom: 50,
          right: 50,
          borderWidth: 1,
          borderRadius: '50%',
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'blue',
        }}
      >
        <Text style={{ fontSize: 30, color: 'white' }}>+</Text>
      </View>
      <MenuButton icon='menu-outline' onPress={() => navigation.openDrawer()} />

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        style={styles.bottomSheet}
        keyboardBehavior='interactive'
      >
        <View
          style={{
            height: '100%',
            backgroundColor: 'white',
            padding: 20,
          }}
          automaticallyAdjustContentInsets={true}
        >
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label='Email'
                type='email-address'
                name='email'
                value={value}
                onChange={onChange}
                onBlur={handleOnBlur}
                onFocus={handleOnFocus}
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
        </View>

        {/* <View style={styles.contentContainer}>
          <BottomSheetTextInput value='Awesome 🎉' style={styles.textInput} />
        </View> */}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },

  textInput: {
    alignSelf: 'stretch',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'grey',
    color: 'white',
    textAlign: 'center',
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default Home;
