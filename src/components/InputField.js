import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const InputField = ({ label, type, name, value, onChange, onBlur, errors }) => {
  const [showPassword, setShowPassword] = useState(true);

  console.log(errors[name]);
  return (
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
          secureTextEntry={type === 'password' && showPassword}
          onBlur={onBlur}
        />

        {name === 'password' || name === 'passwordRepeat' ? (
          <TouchableOpacity
            style={styles.showPassword}
            onPress={() => setShowPassword(!showPassword)}
          >
            <FontAwesome
              name={showPassword ? 'eye' : 'eye-slash'}
              size={18}
              color={'#0C0C0C'}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name].message}</Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  inputField: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
    color: '#0C0C0C',
    fontSize: 12,
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
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

  showPassword: {
    position: 'absolute',
    right: '3%',
    alignSelf: 'center',
    padding: 5,
    zIndex: 1000,
    elevation: 1000,
  },
});

export default InputField;
