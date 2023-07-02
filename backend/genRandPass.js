module.exports = function () {
	let password = Math.random().toString(36).substring(2, 8);

	if (password.length < 6) {
		const additionalChars = Math.random().toString(36).substring(2, 6);
		password += additionalChars;
	}
	
	return password;
};