import {Platform, StyleSheet, Text, View, StatusBar, Image, TouchableHighlight, Button} from 'react-native';
import React, { Component } from 'react';
import { db } from './config';
import t from 'tcomb-form-native';
import Permissions from 'react-native-permissions'
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from 'firebase';
const Form = t.form.Form;
const User = t.struct({
  email: t.String,
  username: t.String,
  password: t.String,
  age: t.Number,
});
export default class Add extends Component {

  handleSubmit = () => {
    const value = this._form.getValue(); // use that ref to get the form value
    console.log(value);
    if(this.state.user == " ")
    {
      console.log('this one')
  
      let uid = Math.floor(Math.random()*100) + 1;
    db.ref('/users').child(uid).set({
      "id":uid,
      "email": value.email,
      "username": value.username,
      "password":value.password,
      "age":value.age
    });
    const ref = firebase.storage().ref(this.state.filePath.uri);
     ref.getDownloadURL().then(data => {
      console.log(data, 'data')
     }).catch(error => {
        console.log(err, error)
    })
   
  }
  else {
 db.ref('/users').child(this.state.user.id).update({
  "id":this.state.user.id,
  "email": value.email,
  "username": value.username,
  "password":value.password,
  "age":value.age
});
  }
    this.props.navigation.navigate('ScreenOne', {userdata:value});
  }

  selectPhoto = () => {
    Permissions.request('photo').then(response => {
      ImagePicker.showImagePicker({title: "", maxWidth: 800, maxHeight: 600}, res => {
        if (res.didCancel) {
          console.log("User cancelled!");
        } else if (res.error) {
          console.log("Error", res.error);
        } else {
          console.log(res);
          this.setState({  filePath: res});
          this.uploadImage(res.uri)
        }
      });
  })
  }
  state = {
    user: [],
    view:'add',
    filePath: {}
  }
  constructor(props){
    
    super(props);
  
  }

  sendChatImage = (path) => {
    const imageRef = firebase
          .storage()
          .ref('img')
          .child('test');
        let mime = 'image/jpg';
  
        imageRef
          .put(path, { contentType: mime })
          .then(() => {
            return imageRef.getDownloadURL();
          })
          .then(url => {
            console.log('url', url)
          });
  }

  uploadImage(uri, mime = 'application/octet-stream') {
    const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob
    return new Promise((resolve, reject) => {
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let uploadBlob = null

      const imageRef = firebase.storage().ref('images').child('image_001')

      fs.readFile(uploadUri, 'base64')
        .then((data) => {
          return Blob.build(data, { type: `${mime};BASE64` })
        })
        .then((blob) => {
          uploadBlob = blob
          return imageRef.put(blob, { contentType: mime })
        })
        .then(() => {
          uploadBlob.close()
          console.log(imageRef.getDownloadURL(), 'downloadUrl')
         imageRef.getDownloadURL().then((url) => {
          console.log('uri22', url)
          db.ref('/images').child('army').set({
            "photo":url
          });
        })
        })
        .then((url) => {
          console.log('uri', uri)
        })
        .catch((error) => {
          reject(error)
      })
    })
  }
  uploadImage2 = (path) => {
    const image = path.uri;
    let fileUri = decodeURI(path.uri)
    console.log('image', image)
    const Blob = RNFetchBlob.polyfill.Blob
    const fs = RNFetchBlob.fs
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
    window.Blob = Blob
 
   
    let uploadBlob = null
    const imageRef = firebase.storage().ref('posts').child("test.jpg")
    let mime = 'image/jpg'
    fs.readFile(fileUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
    })
    .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        // URL of the image uploaded on Firebase storage
        console.log(url);
        
      })
      .catch((error) => {
        console.log(error);
 
      })  
 
}

dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
  }

  componentDidMount() {
    const {state} = this.props.navigation;
   console.log(state.params);
    if(state.params)
    {
   this.setState({user:state.params.user});
    }
    else{
      this.setState({user:" "});
    }
      
  }

  
  static navigationOptions = {
    title: "Add User"
  }
  render() {
    console.log(this.state)
    return (
      <View style={styles.container}>
      <Form  ref={c => this._form = c} type={User}  value={this.state.user}/> 
      <Button
          title="Select Photo"
          onPress={() => this.selectPhoto()}
        />
      <Button
          title="Insert"
          onPress={() => this.handleSubmit()}
        />
          <Image
            source={{ uri: this.state.filePath.uri }}
            style={{ width: 250, height: 250, alignSelf:'center' }}
          />
        
    </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 0,
    padding: 20,
    backgroundColor: '#ffffff',
  },
});