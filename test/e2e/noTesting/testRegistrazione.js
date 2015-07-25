describe('Premi registration page ', function() {
  //variabili globali che riferiscono a elementi del browser .
  var username = element(by.model('user.username'));
  var pass = element(by.model('user.password'));
  var registrationButton = element( by.css('[ng-click="registration()"]') );
  var usernameError = element(by.binding('usernameError'));
  var passwordError = element(by.binding('passwordError'));
  //prima di ogni funzione accedo alla pagina della registrazione
  beforeEach(function(){

    browser.get('http://localhost:8081/#/registrazione');

  })
  
 /* it('should register a new user and redirect to home', function() {
    //genero dei valori casuali e li concateno a 'user-' per poter registrare sempre degli utenti casuali nel server
    var randVal = Date.now();
    username.sendKeys('user-' + randVal);
    pass.sendKeys('password');
    registrationButton.click();
    //finita la registrazione mi aspetto di essere reindirizzato alla 'home'
    expect(element(by.id('home')).isPresent()).toBe(true);
    
  });*/

it('should exists unique username', function() {

 username.sendKeys('LateButSafe');
 pass.sendKeys('password');
 registrationButton.click();
 browser.switchTo().alert().then(function(alert) {
  expect(alert.getText()).toEqual('Username already registered');
  return alert.dismiss();
});
 expect(element(by.id('registration')).isPresent()).toBe(true);

});


it('should insert a valid password', function() {

 var randVal = Date.now();
 username.sendKeys('user-' + randVal);
 pass.sendKeys('pass');
 registrationButton.click();
 expect(passwordError.getText()).toEqual('La password deve essere lunga almeno 6 caratteri');
 expect(element(by.id('registration')).isPresent()).toBe(true);

});





//db.users.remove( { username:  99  } )

});