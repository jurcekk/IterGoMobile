import React from 'react';
import { Controller } from 'react-hook-form';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const InputField = ({
  control,
  errors,
  label,
  name,
  type,
  defaultValue,
  rules,
  onFocus,
  showPassword,
  setShowPassword,
  editable = true,
  onPressIn,
}) => {
  return (
    <Controller
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <View
            style={
              errors[name]
                ? [
                    styles.input,
                    { borderWidth: 1, borderColor: 'red', marginVertical: 4 },
                  ]
                : [styles.input, { marginBottom: 16 }]
            }
          >
            <TextInput
              name={name}
              style={{ flex: 1 }}
              placeholder={label}
              keyboardType={type}
              onChangeText={onChange}
              value={value}
              secureTextEntry={showPassword}
              onBlur={onBlur}
              onFocus={onFocus}
              autoCapitalize='none'
              editable={editable}
              onPressIn={onPressIn}
            />

            {name === 'password' && (
              <TouchableOpacity
                style={styles.showPassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={18}
                  color={'black'}
                />
              </TouchableOpacity>
            )}
          </View>
          {errors[name] && (
            <Text style={styles.errorText}>{errors[name].message}</Text>
          )}
        </>
      )}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
    />
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
  },

  input: {
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
    backgroundColor: '#F2F2F2',
  },

  showPassword: {
    position: 'absolute',
    right: '3%',
    alignSelf: 'center',
    padding: 5,
    zIndex: 1000,
    elevation: 1000,
  },

  showNavigation: {
    alignSelf: 'center',
    marginRight: 10,
    zIndex: 9000,
    elevation: 9000,
  },
});

export default InputField;
