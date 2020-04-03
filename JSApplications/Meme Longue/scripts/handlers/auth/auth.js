import firebaseRequests from '../services/firebase-requests.js';
import { applyCommon } from '../common/common.js';
import { formDataExtractor } from '../services/formDataExtractor.js';
// import { notificate } from '../services/notifications.js';

export async function registerHandler() {
    await applyCommon.call(this);
    await this.partial('./templates/registerPage/registerPage.hbs');
    let userNameField = document.querySelector("#register > form > div:nth-child(1) > input[type=text]:nth-child(5)");
    let passField = document.querySelector("#register > form > div:nth-child(1) > input[type=password]:nth-child(7)");
    let repeatPass = document.querySelector("#register > form > div:nth-child(1) > input[type=password]:nth-child(9)");
    let emailField = document.querySelector("#register > form > div:nth-child(1) > input[type=email]:nth-child(11)");
    let avatarImageLink = document.querySelector("#register > form > div:nth-child(1) > input[type=text]:nth-child(13)");
    let regButton = document.querySelector("#register > form > div:nth-child(1) > button");
    regButton.addEventListener('click', async (e) => {
        e.preventDefault();
        if (userNameField.value !== '' && passField.value !== '' && repeatPass.value !== '' && emailField.value !== '' && avatarImageLink.value !== '') {
            let regFail = false;
            if (repeatPass.value === passField.value) {
                let loadingNot = document.querySelector("#loadingBox")
                loadingNot.style.display = 'block';
                let registerUser = await firebase.auth().createUserWithEmailAndPassword(emailField.value, passField.value)
                    .catch(e => {
                        let errorCode = e.code;
                        let errorNot = document.querySelector("#errorBox")
                        regFail = true;
                        switch (errorCode) {
                            case 'auth/weak-password':
                                errorNot.textContent = 'Your password should be at least six symbols!';
                                break;
                            case 'auth/invalid-email':
                                errorNot.textContent = 'Invalid email!';
                                break;
                            case 'auth/email-already-in-use':
                                errorNot.textContent = 'This email is already in use!';
                                break;
                            default:
                        }
                        loadingNot.style.display = 'none';
                        errorNot.style.display = 'block';
                        errorNot.addEventListener('click', () => {
                            errorNot.style.display = 'none';
                        });
                        this.redirect('#/register');
                    });
                if (!regFail) {
                    let token = await firebase.auth().currentUser.getIdToken();
                    sessionStorage.setItem('username', userNameField.value);
                    sessionStorage.setItem('email', registerUser.user.email);
                    sessionStorage.setItem('userId', firebase.auth().currentUser.uid);
                    sessionStorage.setItem('token', token);
                    sessionStorage.setItem('loggedIn', true);
                    sessionStorage.setItem('avatarImgLink', avatarImageLink.value);
                    let userInfoObj = {
                        username: userNameField.value,
                        avatarLink: avatarImageLink.value,
                        email: emailField.value
                    }
                    let userInfo = await fetch(`https://softunicourses.firebaseio.com/userInfo.json?auth=${sessionStorage.getItem('token')}`, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(userInfoObj)
                    });
                    loadingNot.style.display = 'none';
                    let regNot = document.querySelector("#infoBox");
                    regNot.textContent = 'Registration successfull!';
                    regNot.style.display = 'block';
                    regNot.addEventListener('click', () => {
                        regNot.style.display = 'none';
                        this.redirect('#/home')
                    });
                    setTimeout(() => {
                        if (regNot.style.display !== 'none') {
                            regNot.style.display = 'none';
                            this.redirect('#/home')
                        }
                    }, 5000)
                } else {
                    return;
                }
            } else {
                let errorNot = document.querySelector("#errorNotification");
                errorNot.textContent = 'Passwords must match!';
                errorNot.style.display = 'block';
                errorNot.addEventListener('click', () => {
                    errorNot.style.display = 'none';
                });
            }
        } else {
            let errorNot = document.querySelector("#errorBox");
            errorNot.textContent = 'All fields must be filled!';
            errorNot.style.display = 'block';
            errorNot.addEventListener('click', () => {
                errorNot.style.display = 'none';
            });
            return;
        }
    });
}
export async function logInHandler() {
    await applyCommon.call(this);
    await this.partial('./templates/loginPage/loginPage.hbs');
    let userNameField = document.querySelector("#login > form > div:nth-child(1) > input[type=text]:nth-child(5)");
    let passField = document.querySelector("#login > form > div:nth-child(1) > input[type=password]:nth-child(7)");
    let logInButton = document.querySelector("#login > form > div:nth-child(1) > button");
    logInButton.addEventListener('click', async (e) => {
        e.preventDefault();
        if (userNameField.value !== '' && passField.value !== '') {
            let logInFail = false;
            let loadingNot = document.querySelector("#loadingBox");
            loadingNot.style.display = 'block';
            const loggedInUser = await firebase.auth().signInWithEmailAndPassword(userNameField.value, passField.value)
                .catch(e => {
                    let errorCode = e.code;
                    let errorNot = document.querySelector("#errorBox");
                    logInFail = true;
                    switch (errorCode) {
                        case 'auth/invalid-email':
                            errorNot.textContent = 'Invalid email!'
                            break;
                        case 'auth/user-disabled':
                            errorNot.textContent = 'This user is disabled!'
                            break;
                        case 'auth/user-not-found':
                            errorNot.textContent = 'User not found!';
                            break;
                        case 'auth/wrong-password':
                            errorNot.textContent = 'Wrong Password!'
                            break;
                        default:
                    }
                    loadingNot.style.display = 'none';
                    errorNot.style.display = 'block';
                    errorNot.addEventListener('click', () => {
                        errorNot.style.display = 'none';
                    })
                });
            if (!logInFail) {
                const userToken = await firebase.auth().currentUser.getIdToken();
                sessionStorage.setItem('userId', firebase.auth().currentUser.uid);
                sessionStorage.setItem('token', userToken);
                sessionStorage.setItem('loggedIn', true);
                sessionStorage.setItem('email', userNameField.value);
                let userInfo = await fetch(`https://softunicourses.firebaseio.com/userInfo.json?auth=${sessionStorage.getItem('token')}`)
                    .then(r => r.json());
                let userNeeded = Object.values(userInfo).find(el => el.email === sessionStorage.getItem('email'));
                sessionStorage.setItem('username', userNeeded.username);
                sessionStorage.setItem('avatarImgLink', userNeeded.avatarLink);
                loadingNot.style.display = 'none';
                let logInNot = document.querySelector("#infoBox");
                logInNot.textContent = 'Log In Successfull!';
                logInNot.style.display = 'block';
                logInNot.addEventListener('click', () => {
                    logInNot.style.display = 'none';
                    this.redirect('#/home');
                    return;
                });
                setTimeout(() => {
                    if (logInNot.style.display !== 'none') {
                        logInNot.style.display = 'none';
                        this.redirect('#/home');
                    }
                }, 5000);
            }
        } else {
            let errorNot = document.querySelector("#errorBox");
            errorNot.textContent = 'Please fill all fields!';
            errorNot.style.display = 'block';
            errorNot.addEventListener('click', () => {
                errorNot.style.display = 'none';
            });
        }
    })
}
export async function logOutHandler() {
    sessionStorage.clear();
    let loadingNot = document.querySelector("#loadingBox");
    loadingNot.style.display = 'block';
    firebase.auth().signOut();
    loadingNot.style.display = 'none';
    let logOutSucc = document.querySelector("#infoBox");
    logOutSucc.textContent = 'Logout successfull';
    logOutSucc.style.display = 'block';
    logOutSucc.addEventListener('click', () => {
        logOutSucc.style.display = 'none';
        this.redirect('#/logIn');
    });
    setTimeout(() => {
        if (logOutSucc.style.display !== 'none') {
            logOutSucc.style.display = 'none';
            this.redirect('#/logIn');
        }
    }, 5000)
}