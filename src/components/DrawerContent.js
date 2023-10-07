import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const drawerContent = (props) => {
  const width = useWindowDimensions().width * 0.3;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        justifyContent: 'space-between',
        flex: 1,
        paddingBottom: 20,
        backgroundColor: '#d6d6d650',
      }}
    >
      <View style={styles.menuContainer}>
        <View
          style={[
            styles.menuItemsCard,
            { backgroundColor: '#fff2df', width: width, height: width },
          ]}
        >
          <>
            <View
              style={[styles.circleContainer, { backgroundColor: '#FFC56F' }]}
            >
              <Feather travel name='briefcase' size={25} color='#fbae41' />
            </View>
            <Text style={{ fontSize: 10, color: '#fbae41' }}>Posao</Text>
          </>
        </View>
        <View
          style={[
            styles.menuItemsCard,
            { backgroundColor: '#EFFFD5', width: width, height: width },
          ]}
        ></View>
      </View>
      <TouchableOpacity
        style={[
          styles.menuItemsCard,
          {
            backgroundColor: '#fff',
            height: 50,
            margin: 15,
            flexDirection: 'row',
            gap: 10,
          },
        ]}
        onPress={async () => {}}
      >
        <Feather name='log-out' size={24} color='black' />
        <Text
          style={{
            fontSize: 15,
            color: '#000000',
            fontWeight: 'bold',
          }}
        >
          Odjavi se
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    padding: 10,
    gap: 15,
  },
  menuItemsCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  circleContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default drawerContent;
