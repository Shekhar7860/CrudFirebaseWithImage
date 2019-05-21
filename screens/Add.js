import {Platform, StyleSheet, Text, View, Alert, StatusBar, TouchableOpacity,  Image, ScrollView,   PermissionsAndroid,  TouchableHighlight, Button} from 'react-native';
import React, { Component } from 'react';
import { db } from './config';
import t from 'tcomb-form-native';
import Permissions from 'react-native-permissions'
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from 'firebase';
import DateTimePicker from 'react-native-modal-datetime-picker'
import Moment from 'moment';
const Form = t.form.Form;
const User = t.struct({
  email: t.String,
  name: t.String,
  profile: t.String,
  age: t.Number
});
export default class Add extends Component {
  constructor(props){
    super(props);
    this.state = {
      imageURL : "",
      user: [],
    view:'add',
    filePath: {},
    userImage : "",
    isDateTimePickerVisible: false,
    isDateTimePickerVisible2: false,
    startDateText : '',
    endDateText : '',
    };
   
 }
  handleSubmit () {
   // use that ref to get the form value
   console.log(this._form.getValue(), this.state.imageURL, 'userImage' )
   if(this._form.getValue() && this.state.imageURL)
   {
    console.log(this._form.getValue());
    if(this.state.user == " ")
    {
      console.log('this one')
  
      let uid = Math.floor(Math.random()*100) + 1;
    db.ref('/users').child(uid).set({
      "id":uid,
      "email": this._form.getValue().email,
      "name": this._form.getValue().name,
      "profile":this._form.getValue().profile,
      "age":this._form.getValue().age,
      "DateOfJoining":this.state.startDateText,
      "DateOfBirth":this.state.endDateText,
      "photo" : this.state.imageURL
    });
    
   
  }
  else {
 db.ref('/users').child(this.state.user.id).update({
  "id":this.state.user.id,
  "email": this._form.getValue().email,
  "name": this._form.getValue().name,
  "password":this._form.getValue().profile,
  "DateOfJoining":this.state.startDateText,
  "DateOfBirth":this.state.endDateText,
  "age":this._form.getValue().age,
  "photo" : this.state.imageURL
});
  }
    this.props.navigation.navigate('ScreenOne', {userdata:this._form.getValue()});
}
else
{
Alert.alert("please fill all details")
}
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    console.log("date1", date);
    var newDate = Moment(date).format('DD-MM-YYYY');
    this.setState({ startDateText:newDate})
    this._hideDateTimePicker();
  };

  _showDateTimePicker2 = () => this.setState({ isDateTimePickerVisible2: true });

  _hideDateTimePicker2 = () => this.setState({ isDateTimePickerVisible2: false });

  _handleDatePicked2 = (date) => {
    var newDate = Moment(date).format('DD-MM-YYYY');
    this.setState({ endDateText:newDate})
    this._hideDateTimePicker2();
  };
 selectPhoto  ()  {
   

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
   this.setState({startDateText:state.params.user.DateOfJoining});
   this.setState({endDateText:state.params.user.DateOfBirth});
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
    const defaultImg =
    'https://satishrao.in/wp-content/uploads/2016/06/dummy-profile-pic-male.jpg'
    console.log(this.state)
    return (
      <View style={styles.container}>
      <View>
        <Button
          title="Select Photo"
          onPress={() => this.selectPhoto()}
        />
        </View>
        <View  style={{marginTop:20}}>
      <Button
          title="Insert"
         
          onPress={() => this.handleSubmit()}
        />
          </View>
          <Image
            source={{ uri: this.state.filePath.uri ? this.state.filePath.uri : this.state.userImage }}
            style={{ width: 150, height: 150, alignSelf:'center', borderRadius:75 }}
          />
          
            <ScrollView style={{marginBottom:30}}>
            <Form  ref={c => this._form = c} type={User}  value={this.state.user}/> 
                <Text style={styles.textFont}> Date Of Joining</Text>
                  <TouchableOpacity onPress={this._showDateTimePicker} style={styles.postprojectinput}>
                  <Text style={styles.dateTextColor}>{this.state.startDateText}</Text>
                </TouchableOpacity>
                <Text style={styles.textFont}>Date Of Birth</Text>
                <TouchableOpacity onPress={this._showDateTimePicker2} style={styles.postprojectinput}>
                  <Text style={styles.dateTextColor}>{this.state.endDateText}</Text>
                </TouchableOpacity>
           
       
            </ScrollView>
            <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          
        />
         <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible2}
          onConfirm={this._handleDatePicked2}
          onCancel={this._hideDateTimePicker2}
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
  textFont : {
    fontSize : 17
  },
  postprojectinput: {
    marginBottom:10,
    height: 40,
    borderColor: '#AEA9A8',
    borderWidth: 1,
    padding:5,
    width:'100%',
    fontSize : 17,
    marginTop:10
    },
    dateTextColor :{
      color : '#AEA9A8',
      padding :4,
      fontSize : 17
    }
});