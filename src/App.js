import './App.css';
import jwt_decode from "jwt-decode";
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { 
  ChakraProvider, Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,  Text, Heading, Flex, Box, Image,
} from '@chakra-ui/react';
import LikeButton from './Components/LikeButton';

function App() {
  const [imgUrl, setImgUrl] = useState('');

  const ROOT_API_URL = "https://apod-deploy.vercel.app";
  
  // 
  useEffect(() => {
    axios.get('https://api.nasa.gov/planetary/apod?api_key=qvA7gFAo5laiF8ywDALxTGioR1qy4at5jqYx1iC7')
      .then(res => {
        const fetchedUrl = res.data.url;
        setImgUrl(fetchedUrl);
      })
      .catch(function (error) {
        console.log(error);
      })
  }, []);

  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleGoogleLogin
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googleLoginDiv"),
      { theme: "outline", size: "medium"}
    );
  }, []);

  useEffect(() => {
    console.log(token);
    if (token){
      //setLoginSuccess(true);
      axios.get(`${ROOT_API_URL}/stats`, {
        headers: {
          Authorization: token,
        },
      })
        .then(res => {
          setLoginSuccess(true);
          setLoginData({ username: res.data.username, password: res.data.password })
          console.log(loginData);
        })
        .catch(error => {
          setLoginSuccess(false);
          console.error(error); // Handle the error
          console.log('asdff' + loginSuccess);
        });
    }
  }, []);
  
  // LOGIN/LOGOUT PROPS/STATES

  const [isLoginOpen, setLoginOpen] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [nonexistentUser, setNonexistentUser] = useState(false);
  const [wrongPass, setWrongPass] = useState(false);
    
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [googleLoginEmail, setGoogleLoginEmail] = useState('');

  const CLIENT_ID = "114756700633-3325u1e96o5cahj5ps6t0katbv5sepj4.apps.googleusercontent.com";

  const handleLogin = () => {
    //express code
    axios.post(`${ROOT_API_URL}/api/login`, loginData)
      .then(response => {
        console.log(response.data); // Handle the response data
        // make success msg appear
        setLoginSuccess(true);
        setNonexistentUser(false);
        setWrongPass(false);
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
      })
      .catch(error => {
        console.log(loginData);
        console.error(error); // Handle the error
        if (error.response.status === 404) {
          setLoginSuccess(false);
          setNonexistentUser(true);
          setWrongPass(false);
        } else if (error.response.status === 401) {
          setLoginSuccess(false);
          setNonexistentUser(false);
          setWrongPass(true);
        }
      });
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoginSuccess(false);
    setLoginData({ username: '', password: '' });
    setGoogleUser(null);
  }

  const onLoginClose = () => {
    setLoginOpen(false);
    //setLoginSuccess(false);
    setNonexistentUser(false);
    setWrongPass(false);
  }

  // GOOGLE LOGIN

  const [ googleUser, setGoogleUser ] = useState({});

  function handleGoogleLogin(response){
    console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwt_decode(response.credential);
    console.log(userObject);
    setGoogleUser(userObject);
    setLoginSuccess(true);

    setGoogleLoginEmail(userObject.email);
  }

  useEffect(() => {
    if (googleLoginEmail.length > 0){
      axios.post(`${ROOT_API_URL}/api/google_login`, { email: googleLoginEmail })
      .then(response => {
        console.log(response.data); // Handle the response data
        // make success msg appear
        setLoginSuccess(true);
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setLoginData({...loginData, username: googleLoginEmail })
      })
      .catch(error => {
        console.error(error); // Handle the error
      });
    }
  }, [googleLoginEmail]);

  // SIGNUP PROPS/STATES

  const [isSignupOpen, setSignupOpen] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userTaken, setUserTaken] = useState(false);
  const [invalidInputs, setInvalidInputs] = useState(false);

  const [signupData, setSignupData] = useState({ username: '', password: '', email: '' });

  const handleSignup = () => {
    axios.post(`${ROOT_API_URL}/api/signup`, signupData)
      .then(response => {
        console.log(response.data); // Handle the response data
        // make success msg appear
        setSignupSuccess(true);
        setUserTaken(false);
        setInvalidInputs(false);
      })
      .catch(error => {
        console.error(error); // Handle the error

        if (error.response.status === 409) {
          setSignupSuccess(false);
          setUserTaken(true);
          setInvalidInputs(false);
        } else if (error.response.status === 400) {
          setSignupSuccess(false);
          setUserTaken(false);
          setInvalidInputs(true);
        }
      });
  }

  const onSignupClose = () => {
    setSignupOpen(false);
    setSignupSuccess(false);
    setUserTaken(false);
    setInvalidInputs(false);
  }

  // CONTENT PROPS/STATES

  const [isStatsOpen, setStatsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const onStatsClose = () => {
    setStatsOpen(false);
  }

  const [numLikes, setNumLikes] = useState(0);
  const [dateJoined, setDateJoined] = useState(Date.now);

  const getStats = () => {
    console.log('hi');
    axios.get(`${ROOT_API_URL}/stats`, {
      headers: {
        Authorization: token,
      },
    })
      .then(res => {
        console.log('hello');
        setNumLikes(res.data.likeCount);
        setDateJoined(res.data.joinDate.slice(0, 10));
        console.log(res.data); // Handle the response data
      })
      .catch(error => {
        console.log(token)
        console.error(error); // Handle the error
      });
  }

const onStatsClick = () => {
  getStats();
  setStatsOpen(true)
}

const handleLikeButtonClick = () => {
  setIsLiked(!isLiked);
  if (!isLiked){
    axios.put(`${ROOT_API_URL}/like`, {}, {
      headers: {
        Authorization: token,
      },
    })
      .then(res => {
        console.log('pic liked');
      })
      .catch(e => {
        console.log(e);
      });
  } else {
    axios.put(`${ROOT_API_URL}/dislike`, {},{
      headers: {
        Authorization: token,
      },
    })
      .then(res => {
        console.log('pic disliked');
      })
      .catch(e => {
        console.log(e);
      });
  }
}

  return (
    <ChakraProvider>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
      <Flex flexDirection="column" alignItems="center" paddingTop="100px">
        <Box textAlign="center" marginBottom="25px">
          <Heading as='h2' size='xl'>NASA's Astronomy Picture of the Day</Heading>
        </Box>
        <Flex justifyContent="center" marginBottom="15px">
            <Image src={imgUrl}  alt="NASA APOD" height="400px" objectFit="cover"/>
          </Flex>  
        <Box textAlign="center" marginBottom="15px">
          {loginSuccess && <LikeButton isLiked={isLiked} onLikeButtonClick={handleLikeButtonClick} iconSize="2xl"/>}
          {loginSuccess && <Heading as='h2' size='lg'>Hi, {loginData.username}!</Heading>}
          {loginSuccess && <Button marginTop="20px" onClick={onStatsClick}>See Stats</Button>}
          {!loginSuccess && <Text fontSize='3xl'>Sign in to like the picture!</Text>}
          <Modal isOpen={isStatsOpen} onClose={onStatsClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{loginData.username}'s Stats</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text fontSize='lg'>Liked pictures: {numLikes}</Text>
                <Text fontSize='lg'>Date joined: {dateJoined}</Text>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onStatsClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
        <Flex alignItems="center" marginBottom="15px">
          {!loginSuccess && <Button onClick={() => setLoginOpen(true)}>Login</Button>}
          {!loginSuccess && <Box marginLeft="10px" marginRight="10px" />}
          {!loginSuccess && <Button onClick={() => setSignupOpen(true)}>Sign Up</Button>}
          {loginSuccess && <Button onClick={handleLogout}>Log Out</Button>}
        </Flex>
        <div id="googleLoginDiv"></div>
        <Modal isOpen={isLoginOpen} onClose={onLoginClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Login</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              {loginSuccess && <Text color="blue">Welcome back!</Text>}
              {nonexistentUser && <Text color="blue">Username does not exist.</Text>}
              {wrongPass && <Text color="blue">Incorrect password.</Text>}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleLogin}>
                Login
              </Button>
              <Button variant="ghost" onClick={onLoginClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={isSignupOpen} onClose={onSignupClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Sign Up</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Username"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              />
              <Input
                placeholder="Email address"
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
              {signupSuccess && <Text color="blue">Registration successful!</Text>}
              {userTaken && <Text color="blue">Username/email already exists.</Text>}
              {invalidInputs && <Text color="blue">Please enter valid credentials.</Text>}
              {invalidInputs && <Text color="blue">Username and password must have at least 6 characters. Email must be a valid email address.</Text>}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSignup}>
                Sign Up
              </Button>
              <Button variant="ghost" onClick={onSignupClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
