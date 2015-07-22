describe('Premi Login page ', function() {
  it('should login the user', function() {
    browser.get('http://localhost:8081/');

    var username = element(by.model('user.username')).sendKeys('3');
    var pass = element(by.model('user.password')).sendKeys('ciaociao');
    expect(username.getAttribute('value')).toEqual('3');
    expect(pass.getAttribute('value')).toEqual('ciaociao');

    var loginButton = element( by.css('[ng-click="login()"]') );
    loginURL = browser.getCurrentUrl();
    loginButton.click();
    expect(loginURL).not.toEqual('http://localhost:8081/#/private/home')

    

    
  });

 

});