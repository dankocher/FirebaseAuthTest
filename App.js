import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import { firebase } from '@firebase/app';
import 'firebase/auth';
import { GoogleSignin } from 'react-native-google-signin';
// import * as firebase from 'firebase/auth';
import { Input } from './components/Input';
import { Button } from './components/Button';

export default class App extends Component {

  state = {
    email: '',
    password: '',
    authenticating: false,
    user: null,
    error: '',
  };

  componentWillMount() {
    const firebaseConfig = {
      apiKey: 'AIzaSyDgou3I391c4qRmFsYBPHJiXxQmFw9S3XA',
      authDomain: 'fir-testproject-fa397.firebaseapp.com',
    };
    firebase.initializeApp(firebaseConfig);
  }

  onPressSignIn() {
    this.setState({
      authenticating: true,
    });

    const { email, password } = this.state;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => this.setState({
          authenticating: false,
          user,
          error: '',
        }))
        .catch(() => {
          // Login was not successful
          firebase.auth().createUserWithEmailAndPassword(email, password)
              .then(user => this.setState({
                authenticating: false,
                user,
                error: '',
              }))
              .catch(() => this.setState({
                authenticating: false,
                user: null,
                error: 'Authentication Failure',
              }))
        })
  }

  onPressLogOut() {
    firebase.auth().signOut()
        .then(() => {
          this.setState({
            email: '',
            password: '',
            authenticating: false,
            user: null,
          })
        }, error => {
          console.error('Sign Out Error', error);
        });
  }

  renderCurrentState() {
    if (this.state.authenticating) {
      return (
          <View style={styles.form}>
            <ActivityIndicator size='large' />
          </View>
      )
    }

    if (this.state.user !== null) {
      return (
          <View style={styles.form}>
            <Text>{this.state.user.email}</Text>
            <Button onPress={() => this.onPressLogOut()}>Log Out</Button>
          </View>
      )
    }

    return (
        <View style={styles.form}>
          <Input
              placeholder='Enter your email...'
              label='Email'
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
          />
          <Input
              placeholder='Enter your password...'
              label='Password'
              secureTextEntry
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
          />
          <Button onPress={() => this.onPressSignIn()}>Log In</Button>
          <Button onPress={this.onPressSignInGoogle}>Sign In with google</Button>
          <Button onPress={this.onPressSignInFacebook}>Sign In with Facebook</Button>
          <Text>{this.state.error}</Text>
        </View>
    )

  }
    onPressSignInGoogle = async () => {
        this.setState({
            authenticating: true,
        });
        try {
            await GoogleSignin.configure();
            const data = await GoogleSignin.signIn();
            const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
            const firebaseUserCredential = await firebase.auth().signInAndRetrieveDataWithCredential(credential);
            const user = firebaseUserCredential.user;

            console.log(firebaseUserCredential.user);
            this.setState({
                  authenticating: false,
                  user: firebaseUserCredential.user
              });
        } catch (e) {
            console.log(e);
            this.setState({
                authenticating: false,
                user: null,
                error: 'Authentication Failure',
            })
        }
    };

  render() {
    return (
        <View style={styles.container}>
          {this.renderCurrentState()}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  form: {
    flex: 1
  }
});