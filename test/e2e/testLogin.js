describe('Premi Login page ', function() {
    var username = element(by.model('user.username'));
    var pass = element(by.model('user.password'));
    var loginButton = element( by.css('[ng-click="login()"]'));
    var usernameError = element(by.binding('usernameError'));
    var passwordError = element(by.binding('passwordError'));
   
   beforeEach(function(){
    browser.get('http://localhost:8081/#/login');
    username.clear();
    pass.clear();
    usernameError.clear();
    passwordError.clear();
    
});


  it('should login the user', function() {
    

    username.sendKeys('3');
    pass.sendKeys('ciaociao');
    expect(username.getAttribute('value')).toEqual('3');
    expect(pass.getAttribute('value')).toEqual('ciaociao');
    loginURL = browser.getCurrentUrl();
    loginButton.click();
    expect(loginURL).not.toEqual('http://localhost:8081/#/private/home');
    

  });

 it('should show error when login form is undefined',function(){
          

    //element(by.model('user.username')).clear();
    //element(by.model('user.password')).clear();
    
    //var loginButton = element( by.css('[ng-click="login()"]') );
    //var usernameError = element(by.binding('usernameError'));
    //var passwordError = element(by.binding('passwordError'));
    
    //expect(element(by.binding('usernameError')).getText()).not.toBe('');
    //expect(element(by.binding('passwordError')).getText()).not.toBe('');
    
    //expect(usernameError.getAttribute('value')).toEqual("")
    //expect(passwordError.getAttribute('value')).toEqual("")
     
    
 });
 

});