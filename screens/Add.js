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
  constructor(props){
    super(props);
    this.state = {
      imageURL : "",
      user: [],
    view:'add',
    filePath: {},
    userImage : ""
    };
   
 }
  handleSubmit = () => {
   // use that ref to get the form value
    console.log(this._form.getValue());
    if(this.state.user == " ")
    {
      console.log('this one')
  
      let uid = Math.floor(Math.random()*100) + 1;
    db.ref('/users').child(uid).set({
      "id":uid,
      "email": this._form.getValue().email,
      "username": this._form.getValue().username,
      "password":this._form.getValue().password,
      "age":this._form.getValue().age,
      "photo" : this.state.imageURL
    });
    
   
  }
  else {
 db.ref('/users').child(this.state.user.id).update({
  "id":this.state.user.id,
  "email": this._form.getValue().email,
  "username": this._form.getValue().username,
  "password":this._form.getValue().password,
  "age":this._form.getValue().age,
  "photo" : this.state.imageURL
});
  }
    this.props.navigation.navigate('ScreenOne', {userdata:this._form.getValue()});
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
          const value = this._form.getValue(); // use that ref to get the form value
          console.log(value);
          this.setState({  filePath: res});
          this.uploadImage(res.uri)
        }
      });
  })
  }
  
  

 
  uploadImage(uri, mime = 'application/octet-stream') {
    const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob
    return new Promise((resolve, reject) => {
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let uploadBlob = null
      let uid = Math.random().toString(36).substring(7);
      const imageRef = firebase.storage().ref('images').child(uid)

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
          console.log('uri22', url);
          this.setState({imageURL : url})

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




  componentDidMount() {
    const {state} = this.props.navigation;
   console.log(state.params);
    if(state.params)
    {
   this.setState({user:state.params.user});
   this.setState({userImage : state.params.user.photo})
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
        <Button
          title="Select Photo"
          onPress={() => this.selectPhoto()}
        />
      <Button
          title="Insert"
          onPress={() => this.handleSubmit()}
        />
          <Image
            source={{ uri: this.state.filePath.uri ? this.state.filePath.uri : this.state.userImage }}
            style={{ width: 150, height: 150, alignSelf:'center' }}
          />
      <Form  ref={c => this._form = c} type={User}  value={this.state.user}/> 
    
        
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