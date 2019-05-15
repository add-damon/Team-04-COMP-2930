//Autocomplete for start and destination address
var autocomplete, autocomplete2;
$(document).ready(function () {
  /** 
   * Enables the Departure and Destination Text inputs boxes to autocomplete the user's geographical location,. 
   */
  initAutocomplete();


  $("#startAddress").focus(geolocate());
  $("#destination").focus(geolocate());
});

/** 
 * Enables the Departure and Destination Text inputs boxes to autocomplete the user's geographical location,. 
 */
function geolocate() {

  var geolocation = {
    lat: 49.25,
    lng: -122.8
  };
  var circle = new google.maps.Circle({
    center: geolocation,
    radius: 80000
  });
  autocomplete.setBounds(circle.getBounds());
  autocomplete2.setBounds(circle.getBounds());
}

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
    // /** @type {!HTMLInputElement} */
    (document.getElementById('startAddress')), {
      types: ['geocode']
    });
  autocomplete.setFields(['address_components', 'geometry']);


  //autocomplete.addListener('place_changed', fillInAddress);
  autocomplete2 = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (document.getElementById('destination')), {
      types: ['geocode']
    });
  autocomplete2.setFields(['address_components', 'geometry']);
  //autocomplete2.addListener('place_changed', fillInAddress);
}

$(() => {
  const database = firebase.database();
  const rootRef = database.ref();

  //listens for user authentication status.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      $('.userName').html('<img class="mr-2 ml-2" src="./images/avatar.png" height="25"/>'
        + user.displayName);
      $('button[data-toggle="modal"]').remove();
      console.log('user: ' + user.displayName);
      console.log('uid: ' + user.uid);
    } else {
      $('#settingIcon1, #settingIcon2').html('<button class="btn bg-success text-white" id="signInUpButton"'
        + 'data-toggle="modal" data-target="#exampleModal1">'
        + 'SIGN IN</button>');
      console.log('user: not log in');
    }
  });

  let geocoder = new google.maps.Geocoder;
  $('#getLocationBtn').on('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        geocoder.geocode(
          { 'location': latlng },
          function (results, status) {
            if (status === 'OK') {
              if (results[0]) {
                $('#startAddress').val(results[0].formatted_address);
              } else {
                window.alert('No results found');
              }
            } else {
              window.alert('Geocoder failed due to: ' + status);
            }
          });
      });
    } else {
      alert("Location information is unavailable.");
    }
  });

  // $('#tripForm').on('submit', (e) => {
  //   e.preventDefault();
  //   let url = windows.location.href;
  //   alert(url);
  // });

  $('#exampleModal1').on('shown.bs.modal', function () {
    $('#modal2CloseBtn').click();
  });

  $('#exampleModal2').on('shown.bs.modal', function () {
    $('#modal1CloseBtn').click();
  });

  $('#inputPassword').on("keypress", function (e) {
    if (e.which === 13) {
      toggleSignIn();
    }
  });

  $('#createPassword').on("keypress", function (e) {
    if (e.which === 13) {
      handleSignUp();
    }
  });

  $('.signOutBtn').on('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    firebase.auth().signOut();
    window.location.href = "./index.html";
  });

  if (localStorage.checkBoxValidation && localStorage.checkBoxValidation != '') {
    $('#rememberMe').attr('checked', 'checked');
    $('#inputEmail').val(localStorage.userName);
  } else {
    $('#rememberMe').removeAttr('checked');
    $('#inputEmail').val('');
  }

  document.getElementById('signIn').addEventListener('click', toggleSignIn, false);
  document.getElementById('modalSignUpBtn').addEventListener('click', handleSignUp, false);

  $("#signIn").click(function (e) {
    e.preventDefault();
    if ($('#rememberMe').is(':checked')) {
      // save username and password
      localStorage.userName = $('#inputEmail').val();
      localStorage.checkBoxValidation = $('#rememberMe').val();
    } else {
      localStorage.userName = '';
      localStorage.checkBoxValidation = '';
      $('#rememberMe').removeAttr('checked');
    }
  });

  function toggleSignIn() {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    } else {
      var email = $('#inputEmail').val();
      var password = $('#inputPassword').val();
      firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
        location.reload(true);
      }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        document.getElementById('signIn').disabled = false;
        // [END_EXCLUDE]
      });
      // [END authwithemail]
    }
    document.getElementById('signIn').disabled = false;
  }

  function handleSignUp() {
    var email = document.getElementById('createEmail').value;
    var password = document.getElementById('createPassword').value;

    // Sign in with email and pass.
    // [START createwithemail]
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
      var database = firebase.database();

      var name = document.getElementById('name').value;
      var user = firebase.auth().currentUser;
      console.log(user);
      database.ref('users/' + user.uid).set({
        username: name,
        email: email,
      }, function (error) {
        if (error) {
          // The write failed..
        } else {
          user.updateProfile({
            displayName: $('#name').val()
          }).then(function () {
            location.reload(true);
          });
        }
      });
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
    });
  }

})

$(document).on('click', '#planTrip',
  function redirect(e) {
    e.preventDefault();
    let startA = $('#startAddress').val();
    let destB = $('#destination').val();
    window.location.href = "./map.html" + "#"+ startA + "#"+ destB;
});

