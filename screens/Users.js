import {Platform, StyleSheet, Text,Image,  View, FlatList,ListView,  Button, StatusBar, TouchableHighlight} from 'react-native';
import React, { Component } from 'react';
import { List, ListItem } from "react-native-elements"
import Icon from "react-native-vector-icons/Ionicons";
import { db } from './config';

export default class Users extends Component {
  constructor(props){
   super(props)
   const {state} = this.props.navigation;
    console.log(state.params)
    if(state.params)
    {
    console.log(state.params.userdata)
    }
  this.componentDidMount();
}

state = {
  items: [],
  firebaseImage : ""
}
  componentDidMount() {
    db.ref('/images').child('army').once('value')
    .then((dataSnapshot) => {
      
   console.log('value', dataSnapshot.val().photo)
    this.setState({firebaseImage: dataSnapshot.val().photo})
      
     });
   
    db.ref('/users').once('value')
    .then((dataSnapshot) => {
      let newdata = dataSnapshot.val();
    //  console.log(dataSnapshot)
      let items = Object.values(newdata);
     this.setState({items});
      
     });
  }

  makeRemoteRequest = () => {
   
    
  };

  
  static navigationOptions = function(props) {
    return {
      title: 'Users',
      headerRight: <View  style={{marginRight: 20, paddingTop:5}}><Icon name="ios-add" size={30} onPress={() => props.navigation.navigate('ScreenTwo')}   /></View>
    }
  };
  editUser = (val) => {
    if(val)
    {
    this.props.navigation.navigate('ScreenTwo', { user: val })
    }
    }

    deleteItem = (val) => {
    console.log(val)
     console.log(this.state.items);
     this.state.items.splice(val, 1);
     db.ref('/users').child(val.id).remove();
     this.componentWillReceiveProps();
    }
      
    
    componentWillReceiveProps(nextProps){
      
      db.ref('/users').once('value')
    .then((dataSnapshot) => {
      let newdata = dataSnapshot.val();
      let items = Object.values(newdata);
     this.setState({items});
      
     });
    }
  render() {
    console.log(this.state.items);
    
    return (
      
      <View style={styles.container} >
       
          <FlatList
          data={this.state.items}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) =>
          <View style={styles.flatview} >
            <Text style={styles.name} onPress={() => this.editUser(item)}>{item.username}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Icon name="ios-trash" size={30} onPress={() => this.deleteItem(item)}/>
          </View>
         
            
         
          }
          keyExtractor={item => item.email}
        />
        <Image
            source={{ uri: this.state.firebaseImage }}
            style={{ width: 250, height: 250, alignSelf:'center' }}
          />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
    
  },
  h2text: {
    marginTop: 10,
    fontFamily: 'Helvetica',
    fontSize: 36,
    fontWeight: 'bold',
  },
  flatview: {
    justifyContent: 'center',
    paddingTop: 30,
    borderRadius: 2,
  },
  name: {
    fontFamily: 'Verdana',
    fontSize: 18
  },
  email: {
    color: 'red'
  },
  button: {
    textAlign: 'right',
    marginTop:  -10,
    alignSelf: 'stretch'
  }
  
});