import { GoogleLogin } from 'react-google-login';

const CLIENT_ID = "114756700633-3325u1e96o5cahj5ps6t0katbv5sepj4.apps.googleusercontent.com";

function googleLogin(){
	<div id="googleLoginButton">
		<GoogleLogin
			clientId = {CLIENT_ID}
			data-size = {medium}
			buttonText = "Login"
			onSuccess = {onSuccess}
			onFailure = {onFailure}
			cookiePolicy = {'single_host_origin'}
			isSignedIn = {true}
		/>
	</div>
}