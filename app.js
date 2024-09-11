
import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url';

import axios from 'axios';
import bodyParser from 'body-parser';
import querystring from 'querystring';
import { logger } from './logger.js';
 
//const express = require('express');
//const bodyParser = require('body-parser');

//const path = require('path');
//const axios = require('axios');
//const querystring = require('querystring');
//const { error } = require('console');

//const logger = require('./logger');
//app.use(express.urlencoded({ extended: true })); // To handle URL-encoded form data


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//const logger = path.join(__dirname, 'logger.js')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

app.use(express.json());

const validUsername = 'Admin';
const validPassword = '123';


// Assume the getAccessToken function is defined as described earlier
async function getAccessTokenUser(username, password) {
    try {
        const clientId = 'b87e48d6-2c35-4937-aef2-ff5c3f68b01d';
        const clientSecret = '5wq8Q~JsGQuEA3mKGolOkT8Mu1poQQokQW7WvbfC';
        const tenantId = 'fdc223cd-8687-48e5-b9e8-ad52f8adbdaa';

        const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
        const formData = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'password',
            scope: 'https://graph.microsoft.com/.default',
            username: username,
            password: password
        };

        const response = await axios.post(tokenEndpoint, querystring.stringify(formData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200 && response.data && response.data.access_token) {
            return { userAccessToken: response.data.access_token, status: response.status };
        } else {
            throw new Error('Access token not received');
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error('Error generating access token:', error.response.data);
            return { status: 400 };
        } else {
            console.error('Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }
}

async function getAccessToken() {
    try {
        
        
        //Demo Stefanini creds
        const clientId = 'b87e48d6-2c35-4937-aef2-ff5c3f68b01d';
        const clientSecret = '5wq8Q~JsGQuEA3mKGolOkT8Mu1poQQokQW7WvbfC';
        const tenantId = 'fdc223cd-8687-48e5-b9e8-ad52f8adbdaa';
        
        
        /*
        //###Rockwell creds###
        const clientId = 'a512c065-5017-4961-8406-288cf1ed51fb';
        const clientSecret = 'EEY8Q~pC13fUEERHjipBPQweY8zHdOrPMa3wfb~R';
        const tenantId = '855b093e-7340-45c7-9f0c-96150415893e'
        */
        
        const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
        const formData = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scope: 'https://graph.microsoft.com/.default'
        };
       
        const response = await axios.post(tokenEndpoint, querystring.stringify(formData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response || !response.data || !response.data.access_token) {
            throw new Error('Access token not received');
        }
        
        const generic_access_token = response.data.access_token;
        //console.log(`inside getAccessTokenUser ${generic_access_token}`)
        console.log(`Generated User Access Token`)
        return generic_access_token;
    } catch (error) {
        console.error('Error generating access token:', error);
        throw new Error('Failed to generate access token');
    }
}

// Assume the checkGroupMembership function is defined to check group membership using Microsoft Graph API
async function checkGroupMembership(userId, generic_access_token) {
    const groupCheckResponse = await axios.get(`https://graph.microsoft.com/v1.0/users/${userId}/memberOf`, {
        headers: {
            Authorization: `Bearer ${generic_access_token}`
        }
    });

    const groupMemberships = groupCheckResponse.data.value;
    if (groupMemberships.some(group => group.displayName === 'Test_Security_Group')) {
        return 'Test_Security_Group';
    } else if (groupMemberships.some(group => group.displayName === 'Autopilot_Naveen')) {
        return 'Autopilot_Naveen';
    } else {
        return null;
    }
}


app.get('/', (req, res) => {
    logger.info('index page accessed');
    res.render('index', { message: '' });
});

// Main Login route
// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         console.log(`Inside login route and checking username: ${username}`);

//         const { userAccessToken, status } = await getAccessTokenUser(username, password);

//         if (status === 200) {
//            // console.log(`Access token received: ${accessToken}`);

//             // Get user ID
//             const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
//                 headers: {
//                     Authorization: `Bearer ${userAccessToken}`
//                 }
//             });

//             const userId = userResponse.data.id;
//             const userEmail = userResponse.data.mail || userResponse.data.userPrincipalName;
//             const isMember = await checkGroupMembership(userId, userAccessToken);

//             if (isMember) {
//                 //const userEmail = username; // Assuming the username is the email address
//                 //res.render('dashboard', { userEmail });
//                 res.redirect(`/dashboard?userEmail=${encodeURIComponent(userEmail)}`);
//                 //res.render('dashboard');

//             } else {
//                 console.error('User is not a member of the required group');
//                 res.render('index', { message: `User is not a member of the required group: Autopilot_Naveen` });
//             }
//         } else {
//             console.error('Invalid credentials');
//             res.render('index', { message: 'Provided credentials do not match' });
//         }
//     } catch (error) {
//         console.error('Error during login process:', error.message);
//         res.render('index', { message: 'Something went wrong. Please try again.' });
//     }
// });

// Main Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        logger.info(`Login attempt for user: ${username}`);
        console.log(`Inside login route and checking username: ${username}`);

        const { userAccessToken, status } = await getAccessTokenUser(username, password);

        if (status === 200) {
            const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${userAccessToken}`
                }
            });

            const userId = userResponse.data.id;
            const userEmail = userResponse.data.mail || userResponse.data.userPrincipalName;
            const userGroup = await checkGroupMembership(userId, userAccessToken);

            if (userGroup === 'Test_Security_Group') {
                logger.info(`Successful login for user: ${username}`);

                res.redirect(`/ServicedeskDashboard?userEmail=${encodeURIComponent(userEmail)}`);

            } else if (userGroup === 'Autopilot_Naveen') {
                logger.info(`Successful login for user: ${username}`);

                res.redirect(`/AdminDashboard?userEmail=${encodeURIComponent(userEmail)}`);
            } else {
                console.error('User is not a member of the required groups');
                res.render('index', { message: 'User is not a member of the required groups' });
            }
        } else {
            console.error('Invalid credentials');
            logger.warn(`Failed login attempt for user: ${username}`);
            res.render('index', { message: 'Provided credentials do not match' });
        }
    } catch (error) {
        console.error('Error during login process:', error.message);
        logger.warn(`Failed login attempt for user: ${username}`);
        res.render('index', { message: 'Something went wrong. Please try again.' });
    }
});

//Dashboard.ejs is in a different page
app.get('/dashboard', (req, res) => {
    const userEmail = req.query.userEmail || ''; // Fallback to an empty string if userEmail is not provided
    //const errorMessage = "Device not found. Please enter a valid device name.";
    logger.info('dashboard page accessed');
    res.render('dashboard', {
     // errorMessage: errorMessage,
      userEmail: userEmail
    });
});

//Dashboard.ejs is in a different page
app.get('/ServicedeskDashboard', (req, res) => {
    const userEmail = req.query.userEmail || ''; // Fallback to an empty string if userEmail is not provided
    //const errorMessage = "Device not found. Please enter a valid device name.";
    logger.info('ServicedeskDashboard page accessed');
    res.render('ServicedeskDashboard', {
     // errorMessage: errorMessage,
      userEmail: userEmail
    });
});

app.get('/AdminDashboard', (req, res) => {
    const userEmail = req.query.userEmail || ''; // Fallback to an empty string if userEmail is not provided
    //const errorMessage = "Device not found. Please enter a valid device name.";
    logger.info('AdminDashboard page accessed');
    res.render('AdminDashboard', {
     // errorMessage: errorMessage,
      userEmail: userEmail
    });
});

// app.post('/validateDevice', async (req, res) => {
//     const { deviceName, userEmail } = req.body;

//     // Show loading screen when the request is initiated
//     //let loadingScreen = showLoading();

//     try {
//         const generic_access_token = await getAccessToken();

//         const response = await axios.get('https://graph.microsoft.com/v1.0/deviceManagement/managedDevices', {
//             headers: {
//                 Authorization: `Bearer ${generic_access_token}`
//             },
//             params: {
//                 $filter: `deviceName eq '${deviceName}'`
//             }
//         });

//         // Close the loading screen when the response is received
//         // if (loadingScreen) {
//         //     hideLoading(); // Close the loading screen
//         // }

//         if (response.data.value.length > 0) {
//             const deviceId = response.data.value[0].id;
//             const deviceSerial = response.data.value[0].serialNumber;
//             const compliance = response.data.value[0].complianceState;
//             const lastCheckIn = response.data.value[0].lastSyncDateTime.split('T')[0];
//             const primaryUser = response.data.value[0].userDisplayName;
//             const operatingSystem = response.data.value[0].operatingSystem;
//             console.log(`inside validate device ${deviceSerial},${lastCheckIn},${compliance}`);
//             res.redirect(`/deviceoperations?deviceId=${deviceId}&deviceName=${deviceName}&deviceSerial=${deviceSerial}&compliance=${compliance}&lastCheckIn=${lastCheckIn}&primaryUser=${primaryUser}&operatingSystem=${operatingSystem}&userEmail=${userEmail}`);
//         } else {
//             res.render('dashboard', { errorMessage: 'Device not found. Please try again.' });
//         }
//     } catch (error) {
//         console.error('Error validating device with Intune:', error);
//         res.status(500).send('An error occurred while validating the device.');
//     }
// });


//Dashboard.ejs is in a different page



app.post('/validateServiceDeskUser', async (req, res) => {
    const { userEmail } = req.body;

    if (!userEmail) {
        logger.error('User email is required.');
        return res.status(400).json({ success: false, message: 'User email is required.' });
    }

    try {
        const generic_access_token = await getAccessToken();

        const response = await axios.get(`https://graph.microsoft.com/v1.0/users/${userEmail}/managedDevices?$select=deviceName`, {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            }
        });

        if (response.data.value.length > 0) {
            const devices = response.data.value.map(device => device.deviceName);
            logger.info(`${userEmail}User found. Fetching the devices of the user.`);
            res.json({ success: true, message: 'User found. Fetching the devices of the user.', devices: devices });
        } else {
            res.json({ success: false, message: 'No devices found for this user.' });
            logger.warn(`No devices found for this user ${userEmail}.`);
        }
    } catch (error) {
        console.error('Error validating user with Intune:', error);
        logger.error(`An error occurred while validating the user ${userEmail}.`);
        res.status(500).json({ success: false, message: 'An error occurred while validating the user.' });
    }
});

app.post('/validateAdminUser', async (req, res) => {
    const { userEmail } = req.body;

    if (!userEmail) {
        logger.error(`User Email is required`);
        return res.status(400).json({ success: false, message: 'User email is required.' });
    }

    try {
        const generic_access_token = await getAccessToken();

        const response = await axios.get(`https://graph.microsoft.com/v1.0/users/${userEmail}/managedDevices?$select=deviceName`, {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            }
        });

        if (response.data.value.length > 0) {
            const devices = response.data.value.map(device => device.deviceName);
            logger.info(`User found ${userEmail} Fetching the devices of the user.`);
            res.json({ success: true, message: 'User found. Fetching the devices of the user.', devices: devices });
        } else {
            logger.warn(`No devices found for this user ${userEmail}.`);
            res.json({ success: false, message: 'No devices found for this user.' });
        }
    } catch (error) {
        console.error('Error validating user with Intune:', error);
        logger.error(`An error occurred while validating the user ${userEmail}.`);
        res.status(500).json({ success: false, message: 'An error occurred while validating the user.' });
    }
});


function decodeBase64Password(base64String) {
    // Create a buffer from the Base64 encoded string
    let buffer = Buffer.from(base64String, 'base64');
    // Convert the buffer to a UTF-8 string
    let decodedString = buffer.toString('utf8');
    return decodedString;
}


app.get('/deviceoperations', (req, res) => {
    const { deviceId, deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } = req.query;
    logger.info(`Accessing deviceoperations.`);
    res.render('deviceoperations', {
        deviceId,
        deviceName,
        deviceSerial,
        compliance,
        lastCheckIn,
        primaryUser,
        operatingSystem
    });
});

app.get('/serviceDeskdeviceoperations', (req, res) => {
    const { deviceId, deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } = req.query;
    logger.info(`Accessing serviceDeskdeviceoperations.`);
    res.render('serviceDeskdeviceoperations', {
        deviceId,
        deviceName,
        deviceSerial,
        compliance,
        lastCheckIn,
        primaryUser,
        operatingSystem
    });
});

// app.get('/device-details', async (req, res) => {
//     const deviceName = req.query.deviceName; // Get deviceName from query parameters

//     try {
//         const generic_access_token = await getAccessToken(); // Fetch the access token
//         const deviceDetailsResponse = await axios.get('https://graph.microsoft.com/v1.0/deviceManagement/managedDevices', {
//             headers: {
//                 Authorization: `Bearer ${generic_access_token}`
//             },
//             params: {
//                 $filter: `deviceName eq '${deviceName}'`
//             }
//         });

//         if (deviceDetailsResponse.data.value.length > 0) {
//             const serialNumber = deviceDetailsResponse.data.value[0].serialNumber;
//             //const phoneNumber = deviceDetailsResponse.data.value[0].phoneNumber;
//             console.log(`Device Serial Number: ${serialNumber}`);
//             res.status(200).json({ serialNumber: serialNumber });
//         } else {
//             console.error('Failed to fetch device details');
//             res.status(404).json({ error: 'Device not found' });
//         }
//     } catch (error) {
//         console.error('Error fetching device details:', error);
//         res.status(500).json({ error: 'Error fetching device details' });
//     }
// });
  
app.get('/device-details', async (req, res) => {
    const deviceName = req.query.deviceName; // Get deviceName from query parameters

    try {
        const generic_access_token = await getAccessToken(); // Fetch the access token
        const deviceDetailsResponse = await axios.get('https://graph.microsoft.com/v1.0/deviceManagement/managedDevices', {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            },
            params: {
                $filter: `deviceName eq '${deviceName}'`,
                $select: 'serialNumber,operatingSystem,complianceState,lastSyncDateTime,phoneNumber'
            }
        });

        if (deviceDetailsResponse.data.value.length > 0) {
            const device = deviceDetailsResponse.data.value[0];
            const deviceDetails = {
                serialNumber: device.serialNumber,
                operatingSystem: device.operatingSystem,
                complianceState: device.complianceState,
                //primaryUser: device.userPrincipalName,
                lastCheckIn: device.lastSyncDateTime,
                phoneNumber: device.phoneNumber || '0000000000'
            };
            
            console.log('Device Details:', deviceDetails);
            res.status(200).json(deviceDetails);
        } else {
            console.error('Failed to fetch device details');
            res.status(404).json({ error: 'Device not found' });
        }
    } catch (error) {
        console.error('Error fetching device details:', error);
        res.status(500).json({ error: 'Error fetching device details' });
    }
});


app.get('/Admindeviceoperations', (req, res) => {
    const { deviceId, deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } = req.query;
    //serialNumber  = fetchDevicedetails(deviceName);
    logger.info(req.query)
    //const phoneNumber = '555-1234'; 
    logger.info(`Accessing Admindeviceoperations.`);
    res.render('Admindeviceoperations', {
        deviceId,
        deviceName,
        deviceSerial,
        compliance,
        lastCheckIn,
        primaryUser,
        operatingSystem,
         
    });
});

app.get('/iphone', (req, res) => {
    logger.info(`Accessing iPhone Lost.`);
    res.render('iphone');
});

app.get('/sendEmail', (req, res) => {
    const { username } = req; // Access the username from the request object
    logger.info(`Accessing send Email`);
    res.render('sendEmail',{ username });
});
// Middleware to handle URL-encoded form data
app.use(express.urlencoded({ extended: true }));


async function byodWipeDelete(deviceId) {
    try {

        const generic_access_token = await getAccessToken();

        // Send a request to wipe the device
        //Initial Wipe URL `https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/${deviceId}/wipe`
        //New Wipe Yet to Test `https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/{deviceId}/microsoft.graph.wipe`

        //Initial Wipe of Device
        // const wipeResponse = await axios.post(`https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/${deviceId}/wipe`, {

        //     headers: {
        //         Authorization: `Bearer ${accessToken}`
        //     }
        // });


        console.log(`deviceId ${deviceId}`)
        //New Wipe Yet to Test 
        console.log(`inside BYOD Function ${deviceId}`)
        const wipeResponse = await axios.post(`https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/${deviceId}/microsoft.graph.wipe`, {        }, {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            }
        });
        //console.log(`wipe response ${wipeResponse}`)

        // Send a request to delete the device
        const deletionResponse = await axios.delete(`https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/${deviceId}`, {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            }
         });

        // Check if both requests were successful
        console.log(`wipe response ${wipeResponse.status}`)
        //console.log(`deletion response ${deletionResponse.status}`)
        if (wipeResponse.status === 204 && deletionResponse.status === 204) {
            console.log("Request for wiping and deleting the device was successful");
            logger.error(`Request for wiping and deleting the device is successfull.`);
            return true;
        } else {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            logger.error(`An error occurred while wiping and deleting the device.`);
            return false;
        }
    } catch (error) {
        console.error('Error performing wipe and delete operations:', error.response.data);
        logger.error(`Error occurred while performing wipe and delete operations`);
        return false;
    }
}

// Define the enableLostMode function
async function enableLostMode(deviceId, customMessage, phoneNumber) {
    console.log(`inside enableLostMode function`)
    const enableLostModeUrl = `https://graph.microsoft.com/beta/deviceManagement/managedDevices/${deviceId}/microsoft.graph.enableLostMode`;
    console.log(enableLostModeUrl)

    const enableLostModePayload = {
        message: "Iphone is Lost please contact your Admin team",
        phoneNumber: "9666287004"
    };
    
    //console.log(enableLostModePayload)

    try {
        const generic_access_token = await getAccessToken();

        const enableLostModeResponse = await axios.post(enableLostModeUrl, enableLostModePayload, {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            }
        });
        //console.log(`enableLostMode response ${enableLostModeResponse}`)
        if (enableLostModeResponse.status === 200) {
            console.log("Request enabled for iPhone lost mode");
            logger.info(`Lost mode enabled for the iPhone.`);
            return true;
        } else {
            console.error(`Error: ${enableLostModeResponse.status} - ${enableLostModeResponse.data}`);
            logger.error(`Error occurred while enabling the lost mode.`);
            return false;
        }
    } catch (error) {
        console.error('Error enabling lost mode:', error);
        logger.error(`Error occured while enabling the lost mode for the device.`);

        return false;
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/iphoneLost', async (req, res) => {
    console.log('Received POST request to /iphoneLost');
    console.log('Received data:', req.body);
    const { serialNumber, deviceName, phoneNumber, emailAddress } = req.body;
    console.log(`inside iphoneLost route`);
    console.log(`serialNumber ${serialNumber}`);
    console.log(`deviceName ${deviceName}`);
    console.log(`phoneNumber ${phoneNumber}`);
    console.log(`emailAddress ${emailAddress}`);

    if (!deviceName || !serialNumber || !phoneNumber || !emailAddress) {
        console.error('Missing required fields');
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const generic_access_token = await getAccessToken();

        const response = await axios.get('https://graph.microsoft.com/v1.0/deviceManagement/managedDevices', {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            },
            params: {
                $filter: `deviceName eq '${deviceName}'`
            }
        });

        if (response.data.value.length > 0) {
            const device = response.data.value[0];
            const deviceSerial = device.serialNumber;
            const compliance = device.complianceState;
            const lastCheckIn = device.lastSyncDateTime.split('T')[0];
            const primaryUser = device.userDisplayName;
            const operatingSystem = device.operatingSystem;

            if (device.serialNumber === serialNumber) {
                const enrollmentType = device.deviceEnrollmentType;
                const deviceId = device.id;

                if (enrollmentType === 'userEnrollment') {
                    console.log(`Device Name: ${deviceName} (ID: ${deviceId}) is a BYOD device.`);
                    const wipeDeleteStatus = await byodWipeDelete(deviceId);

                    if (wipeDeleteStatus === true) {
                        const emailResponse = await sendDeviceDetailsEmail(deviceName, emailAddress, device.model, operatingSystem, phoneNumber, serialNumber, device.imei);
                        if (emailResponse.status === 'success') {
                            logger.info(`Device Name: ${deviceName} (ID: ${deviceId}) is a BYOD device. Wipe and deletion operations performed successfully. Email sent successfully.`);
                            //return res.json({ success: true, message: 'iPhone Lost request processed successfully for BYOD device', deviceDetails: { deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } });
                            return res.json({ 
                                success: true, 
                                message: 'iPhone Lost request processed successfully for BYOD device', 
                                deviceDetails: { 
                                    deviceName, 
                                    deviceSerial, 
                                    compliance, 
                                    lastCheckIn, 
                                    operatingSystem 
                                } 
                            });
                        } else {
                            logger.info(`Device Name: ${deviceName} (ID: ${deviceId}) is a BYOD device. Wipe and deletion operations performed successfully. Failed to send email.`);
                            return res.json({ success: false, message: 'Wipe and deletion successful but failed to send email', deviceDetails: { deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } });
                        }
                    } else {
                        logger.info(`Error performing wipe and deletion operations.`);
                        return res.json({ success: false, message: 'Error performing wipe and deletion operations', deviceDetails: { deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } });
                    }
                } else if (enrollmentType === 'appleBulkWithUser') {
                    console.log(`Device Name: ${deviceName} (ID: ${deviceId}) is a DEP device.`);
                    const customMessage = 'Your device is lost. Please contact us if found.';
                    const enableLostModeStatus = await enableLostMode(deviceId, customMessage, phoneNumber);

                    if (enableLostModeStatus === true) {
                        logger.info(`Lost mode enabled for the device ${deviceName}.`);
                        return res.json({ success: true, message: 'Lost mode enabled successfully', deviceDetails: { deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } });
                    } else {
                        logger.error(`Error enabling lost mode for the device ${deviceName}.`);
                        return res.json({ success: false, message: 'Error enabling lost mode', deviceDetails: { deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } });
                    }
                } else {
                    logger.info(`Device Name: ${deviceName} (ID: ${deviceId}) Not a BYOD and Not a DEP device: ${enrollmentType}`);
                    return res.json({ success: false, message: 'Device is neither BYOD nor DEP', deviceDetails: { deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } });
                }
            } else {
                logger.info(`Serial number does not match for the device ${deviceName}.`);
                return res.json({ success: false, message: 'Serial number does not match', deviceDetails: { deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem } });
            }
        } else {
            logger.info(`Device not found. ${deviceName}.`);
            return res.json({ success: false, message: 'Device not found', deviceName });
        }
    } catch (error) {
        console.error('Error setting the iPhone Lost:', error);
        logger.error(`Error setting the iPhone Lost: ${error.message}`);
        return res.status(500).json({ success: false, message: 'An error occurred while processing the iPhone Lost request', error: error.message });
    }
});
// Function to send an email with device details
async function sendDeviceDetailsEmail(deviceName, emailAddress) {
    try {
        // Get access token
        const generic_access_token = await getAccessToken();
        
        // Fetch device details from the Microsoft Graph API
        const deviceDetailsResponse = await axios.get('https://graph.microsoft.com/v1.0/deviceManagement/managedDevices', {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            },
            params: {
                $filter: `deviceName eq '${deviceName}'`
            }
        });

        if (deviceDetailsResponse.data.value.length > 0) {
            const device = deviceDetailsResponse.data.value[0];
            const model = device.model;
            const phoneNumber = device.phoneNumber;
            const osVersion = device.operatingSystem;
            const serialNumber = device.serialNumber;
            const IMEI = device.imei;

            // Construct the email body
            const emailBody = `Hello Team,\n\nPlease suspend the service for the below mentioned device as the device has been lost\\Stolen.\n\nModel - iPhone: ${model}\nOS Version - ${osVersion}\nPhone Number: ${phoneNumber}\nSerial Number: ${serialNumber}\nIMEI: ${IMEI}\n\nBest Regards,\n\nStefanini Team.`;

            // Send the email using the Microsoft Graph API
            const response = await axios.post('https://graph.microsoft.com/v1.0/users/Super.user@stefaninidemo1.onmicrosoft.com/microsoft.graph.sendMail', {
                message: {
                    subject: `${deviceName}`,
                    body: {
                        contentType: 'Text',
                        content: emailBody
                    },
                    toRecipients: [{ emailAddress: { address: emailAddress } }],
                    ccRecipients: [{ emailAddress: { address: "pavankumar.nagamalla@stefanini.com" } }],
                },
                saveToSentItems: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${generic_access_token}`
                }
            });

            // Log the response
            console.log('Email sent successfully:', response.data);
            logger.info(`Email sent successfully`);
            return { status: 'success', message: 'Email sent successfully' };
        } else {
            logger.error(`Failed to sent email`);
            return { status: 'error', message: 'Failed to send Email' };
            
            
        }
    } catch (error) {
        // Log the error
        console.error('Error sending email:', error);
        logger.error(`Error sending email`);

        return { status: 'error', message: 'Failed to send email' };
    }
}

// Route to handle sending email
app.post('/sendEmail', async (req, res) => {
    const { deviceName, emailAddress } = req.body;

    console.log(`Inside sendEmail: ${emailAddress}`);
    try {
        // Get access token
        const generic_access_token = await getAccessToken();
        
        const deviceDestialsResponse = await axios.get('https://graph.microsoft.com/v1.0/deviceManagement/managedDevices', {
            headers: {
                Authorization: `Bearer ${generic_access_token}`
            },
            params: {
                $filter: `deviceName eq '${deviceName}'`
            }
        });

        if (deviceDestialsResponse.data.value.length > 0) {
            const deviceId = deviceDestialsResponse.data.value[0].id;
            const model = deviceDestialsResponse.data.value[0].model;
            const phoneNumber = deviceDestialsResponse.data.value[0].phoneNumber;
            const osVersion = deviceDestialsResponse.data.value[0].operatingSystem;
            const serialNumber = deviceDestialsResponse.data.value[0].serialNumber;
            const IMEI = deviceDestialsResponse.data.value[0].imei;

        // Make the Graph API call to send email using the obtained access token
        const emailBody = `Hello Team,\n\nPlease suspend the service for the below mentioned device as the device has been lost\\Stolen.\n\nModel - iPhone : ${model}\nOS Version - ${osVersion}\nPhone Number :${phoneNumber} \nSerial Number :${serialNumber}\nIMEI :${IMEI}\n\nBest Regards,\n\nStefanini Team.`;

        const response = await axios.post('https://graph.microsoft.com/v1.0/users/Super.user@stefaninidemo1.onmicrosoft.com/microsoft.graph.sendMail', {
                message: {
                    subject: `${deviceName}`,
                    body: {
                        contentType: 'Text',
                        content: emailBody
                    },
                    toRecipients: [{ emailAddress: { address: emailAddress } }],
                    ccRecipients: [{ emailAddress: { address: "pavankumar.nagamalla@stefanini.com" } }], //fareed.siddiqui@stefanini.com
                },
                saveToSentItems: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${generic_access_token}`
                }
            });
            

        // Log the response
        console.log('Email sent successfully:', response.data);
        
        logger.info(`Email sent successfully`);
        // Send a success response to the client
        //res.status(200).send('Email sent successfully');
        const successMessage = `Email sent successfully`;
        return res.render('deviceoperations', { successMessage, deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem });

    } else {
        //res.send('Device not found.');
        const errorMessage = `Device not found.`;
        logger.error(`Failed to send email`);
        
        return res.render('deviceoperations', { errorMessage, deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem });

    }
    } catch (error) {
        // Log the error
        console.error('Error sending email:', error);
        logger.error(`Error sending email`);

        // Send an error response to the client
       // res.status(500).send('Error sending email:');
        const errorMessage = `Device not found.`;
        return res.render('deviceoperations', { errorMessage, deviceName, deviceSerial, compliance, lastCheckIn, primaryUser, operatingSystem });

    }
});


app.get('/logout', (req, res) => {
    logger.info(`Accessing Logout funcitonality`)
    res.render('index', { message: '' });
  });

function showLoadingScreen() {
    const loadingScreen = window.open('loading.html', '_blank', 'width=300,height=200');
    return loadingScreen;
}

const PORT = process.env.PORT || 18000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
