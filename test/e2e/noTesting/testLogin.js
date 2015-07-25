'use strict';


describe('Premi Login page ', function() {
  //variabili globali che riferiscono a elementi del browser .
 var username = element(by.model('user.username'));
 var pass = element(by.model('user.password'));
 var loginButton = element( by.css('[ng-click="login()"]'));
 var logoutButton = element (by.css('[ng-click="logout()"]'));
 var usernameError = element(by.binding('usernameError'));
 var passwordError = element(by.binding('passwordError'));
//prima di ogni funzione accedo alla pagina della registrazione
 beforeEach(function(){

  browser.get('http://localhost:8081/#/login');

});

 it('should load the main page',function(){

  expect(element(by.id('access')).isPresent()).toBe(true);

});


 it('should login the user', function() {




  username.sendKeys('test');
  pass.sendKeys('password');
  expect(username.getAttribute('value')).toEqual('test');
  expect(pass.getAttribute('value')).toEqual('password');
  loginButton.click();
    //mi aspetto di essere nella home
    expect(element(by.id('home')).isPresent()).toBe(true);

  });


 it('should show error when login form is undefined',function(){

  loginButton.click();

  expect(usernameError.getText()).toEqual('Inserire username');

  expect(passwordError.getText()).toEqual('Inserire password');




});

});



