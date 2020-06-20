const domain = 'meet.jit.si';
const options = {
    roomName: 'welcometoinvid',
    width: 1060,
    height: 615,
    parentNode: document.querySelector('#meet')
};
const api = new JitsiMeetExternalAPI(domain, options);


//  haven't connected with ejs file ,it is for jitsi connection, 
// will attach after accessing the raise hand script file