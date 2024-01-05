import { DrawerContentScrollView } from '@react-navigation/drawer';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const drawerContent = (props) => {
  const width = useWindowDimensions().width * 0.2;
  const navigation = useNavigation();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            props.navigation.closeDrawer();
          }}
        >
          <AntDesign name='leftcircle' size={25} color='#ff6e2a' />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editProfileText}>Uredi profil</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfo}>
        {/* Profile info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#ff6e2a',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#fafafa',
              }}
            >
              A
            </Text>
          </View>
          <View
            style={{
              marginLeft: 10,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: '#000000',
              }}
            >
              Ana Anić
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: '#000000',
              }}
            >
              @anaanic
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {/* Broj voznji */}
        <View
          style={[
            styles.menuItemsCard,
            { backgroundColor: '#fafafa', width: width, height: width },
          ]}
        >
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'space-evenly',
              alignItems: 'flex-start',
              padding: 10,
              paddingTop: 5,
            }}
          >
            <FontAwesome5 name='car-alt' size={24} color='#ff6e2a' />
            <Text
              style={{
                fontSize: 15,
                color: '#000000',
                fontWeight: 'bold',
              }}
            >
              2
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: '#000000',
              }}
            >
              Broj vožnji
            </Text>
          </View>
        </View>
        {/* Duzina puteva */}
        <View
          style={[
            styles.menuItemsCard,
            { backgroundColor: '#fafafa', width: width, height: width },
          ]}
        >
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'space-evenly',
              alignItems: 'flex-start',
              padding: 10,
              paddingTop: 5,
            }}
          >
            <FontAwesome5 name='road' size={24} color='#ff6e2a' />
            <Text
              style={{
                fontSize: 15,
                color: '#000000',
                fontWeight: 'bold',
              }}
            >
              2
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: '#000000',
              }}
            >
              Dužina puteva
            </Text>
          </View>
        </View>
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
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    padding: 10,
    gap: 20,
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

  container: {
    flex: 1,
    paddingBottom: 20,
    backgroundColor: '#d6d6d650',
  },

  header: {
    width: '100%',
    height: 60,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },

  backButton: {
    zIndex: 1,
    elevation: 1,
  },

  editProfileButton: {
    borderRadius: 30,
    backgroundColor: '#ff6e2a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingHorizontal: 15,
  },

  editProfileText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fafafa',
  },

  profileInfo: {
    width: '100%',
    height: 60,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default drawerContent;
