describe('Premi Login page ', function() {
    var username = element(by.model('user.username'));
    var pass = element(by.model('user.password'));
    var loginButton = element( by.css('[ng-click="login()"]'));
    var usernameError = element(by.binding('usernameError'));
    var passwordError = element(by.binding('passwordError'));
   
   beforeEach(function(){
    browser.get('http://localhost:8081/#/login');
    
});


  it('should login the user', function() {
    

    username.sendKeys('3');
    pass.sendKeys('ciaociao');
    expect(username.getAttribute('value')).toEqual('3');
    expect(pass.getAttribute('value')).toEqual('ciaociao');
    browser.pause();
    loginURL = browser.getCurrentUrl();
    loginButton.click();
    browser.pause();
    expect(loginURL).not.toEqual('http://localhost:8081/#/private/home');

    

  });

 it('should show error when login form is undefined',function(){
          


    loginButton = element( by.css('[ng-click="login()"]') );

    /*usernameError.getAttribute('value').then(function(val){ expect(val).toBe('Inserire username');
        });
    passwordError.getAttribute('value').then(function(val){ expect(val).toBe('Inserire password');
        });*/
     
      expect(usernameError.getText()).toEqual('Inserire username');
      expect(passwordError.getText()).toEqual('Inserire password');
      browser.pause();
});

});