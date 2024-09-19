import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../env';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChatScreen = ({route, navigation}) => {
  const {userId, receiverId, receiverName, receiverProfilePhoto} = route.params;
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      if (conversationId) {
        await fetchChatMessages(conversationId);
      } else {
        await fetchConversationId();
      }
      setLoading(false);
    };

    initializeChat();
  }, [conversationId]);

  const fetchConversationId = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!receiverId) {
        console.error('Receiver ID is not provided');
        return;
      }

      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId: receiverId,
        }),
      });

      const data = await response.json();
      console.log('Fetch Conversation Response:', data);

      if (response.ok) {
        if (data.conversationId) {
          setConversationId(data.conversationId);
          await fetchChatMessages(data.conversationId);
          console.log('Conversation ID:', data.conversationId);
        } else {
          console.error('Conversation ID not returned');
        }
      } else {
        console.error('Error fetching conversation:', data.message);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchChatMessages = async conversationId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!conversationId) {
        console.error('Conversation ID is not available');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/messages/${conversationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      console.log('Fetch Chat Messages Response:', data);

      if (response.ok) {
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          console.error('Messages data is not an array');
        }
      } else {
        console.error('Error fetching chat messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!conversationId) {
      console.error('Conversation ID is not available');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(
        `${API_URL}/api/messages/${conversationId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senderId: userId,
            receiverId: receiverId,
            text: newMessage,
          }),
        },
      );

      const data = await response.json();
      console.log('Send Message Response:', data);

      if (response.ok) {
        await fetchChatMessages(conversationId);
        setNewMessage('');
      } else {
        console.error('Error sending message:', data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderMessageItem = ({item}) => {
    const isSender = item.sender === userId;
    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.senderContainer : styles.receiverContainer,
        ]}>
        {!isSender && (
          <Image
            source={{uri: `${API_URL}/${item.senderProfilePhoto}`}}
            style={styles.profilePhoto}
          />
        )}
        <View
          style={[
            styles.messageContent,
            isSender ? styles.senderMessage : styles.receiverMessage,
          ]}>
          <Text
            style={[
              styles.username,
              isSender ? styles.senderUsername : styles.receiverUsername,
            ]}>
            {item.senderUsername}
          </Text>
          <Text
            style={[
              styles.messageText,
              isSender ? styles.senderMessageText : styles.receiverMessageText,
            ]}>
            {item.text}
          </Text>
        </View>
        {isSender && (
          <Image
            source={{uri: `${API_URL}/${item.senderProfilePhoto}`}}
            style={styles.profilePhoto}
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{uri: receiverProfilePhoto}}
          style={styles.headerProfilePhoto}
        />
        <Text style={styles.headerTitle}>{receiverName}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        style={styles.flatList}
        // inverted // Inverts the list to show the latest messages at the bottom
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={24} color="#26275B" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#26275B',
  },
  headerProfilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  flatList: {
    flex: 1, // Allow the FlatList to fill the remaining space
  },
  listContainer: {
    paddingVertical: 10, // Padding to avoid hiding the last message
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    // position:"absolute",
    // bottom:5
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  senderContainer: {
    justifyContent: 'flex-end',
  },
  receiverContainer: {
    justifyContent: 'flex-start',
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
  },
  senderMessage: {
    backgroundColor: '#dfe7fd',
    width: '80%',
    marginRight: 5,
  },
  receiverMessage: {
    backgroundColor: '#fff',
    width: '80%',
    marginLeft: 5,
  },
  messageText: {
    fontSize: 16,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  senderMessageText: {
    color: '#000',
  },
  receiverMessageText: {
    color: '#000',
  },
  sendButton: {
    padding: 10,
  },
});

export default ChatScreen;
