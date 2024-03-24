import { DrawerContentScrollView } from '@react-navigation/drawer';
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, get, onValue } from 'firebase/database';
import Toast from 'react-native-toast-message';
import { UserContext } from '../context/UserContext';

const drawerContent = (props) => {
  // const [data, setData] = useState(null);
  const width = useWindowDimensions().width * 0.2;
  const navigation = useNavigation();
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const { user } = useContext(UserContext);

  // const getUserData = () => {
  //   try {
  //     const dbRef = ref(db, 'users/' + auth.currentUser.uid);
  //     onValue(dbRef, (snapshot) => {
  //       if (!snapshot.exists()) {
  //         return;
  //       }
  //       const user = snapshot.val();
  //       setData(user);
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   if (!auth.currentUser) return;
  //   getUserData();

  //   console.log('DATA', data);
  // }, []);

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
          <View style={styles.profileCard}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#fafafa',
              }}
            >
              {user?.firstName && user?.firstName[0]}
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
              {user?.firstName} {user?.lastName}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: '#000000',
              }}
            >
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {/* Broj voznji */}
        <View
          style={[
            styles.menuItemsCard,
            {
              backgroundColor: '#fafafa',
              height: width,
              flex: 1,
            },
          ]}
        >
          <View style={styles.menuItemContainer}>
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
            {
              backgroundColor: '#fafafa',
              height: width,
              flex: 1,
            },
          ]}
        >
          <View style={styles.menuItemContainer}>
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
      {user?.role === 'driver' ? (
        <TouchableOpacity
          style={[
            styles.menuItemsCard,
            {
              backgroundColor: '#fff',
              height: 50,
              margin: 15,
              flexDirection: 'row',
              gap: 10,
              marginBottom: 10,
            },
          ]}
          onPress={() => {
            props.navigation.navigate('Driver');
          }}
        >
          <FontAwesome5 name='car-side' size={20} color='black' />
          <Text
            style={{
              fontSize: 15,
              color: '#000000',
              fontWeight: 'bold',
            }}
          >
            Vožnje
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.menuItemsCard,
            {
              backgroundColor: '#fff',
              height: 50,
              margin: 15,
              flexDirection: 'row',
              gap: 10,
              marginBottom: 10,
            },
          ]}
          onPress={() => {
            const dbRef = ref(db, 'users/' + auth.currentUser.uid);
            get(dbRef).then((snapshot) => {
              if (!snapshot.exists()) {
                return;
              }
              const user = snapshot.val();

              if (user.role === 'driver') {
                Toast.show({
                  type: 'error',
                  position: 'top',
                  topOffset: 60,
                  text1: 'Već ste vozač',
                  text2: 'Već ste vozač, ne možete ponovno postati vozač.',
                  visibilityTime: 3000,
                  autoHide: true,
                });
              } else {
                props.navigation.navigate('BecomeDriver');
              }
            });
          }}
        >
          <FontAwesome5 name='car-side' size={20} color='black' />
          <Text
            style={{
              fontSize: 15,
              color: '#000000',
              fontWeight: 'bold',
            }}
          >
            Postani vozač
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.menuItemsCard,
          {
            backgroundColor: '#fff',
            height: 50,
            margin: 15,
            flexDirection: 'row',
            gap: 10,
            marginTop: 0,
          },
        ]}
        onPress={() => {
          Alert.alert(
            'Odjava',
            'Da li ste sigurni da želite da se odjavite?',
            [
              {
                text: 'Odustani',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'Odjavi se',
                onPress: () => {
                  signOut(auth)
                    .then(() => {
                      console.log('User signed out!');
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                },
              },
            ],
            { cancelable: false }
          );
        }}
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
  profileCard: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6e2a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuItemContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    padding: 10,
    paddingTop: 5,
  },
});

export default drawerContent;
