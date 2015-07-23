describe('Premi registration page ', function() {
  it('should show error message', function() {
    browser.get('http://localhost:8081/index.html#/registrazione');

    var username = element(by.model('user.username')).sendKeys('3');
    var pass = element(by.model('user.password')).sendKeys('ciaociao');


    var registrationButton = element( by.css('[ng-click="registration()"]') );
    loginURL = browser.getCurrentUrl();
    registrationButton.click();
    expect(loginURL).not.toEqual('http://localhost:8081/#/private/home')

    browser.manage().logs().get('browser').then(function(browserLog) {
        console.log('\n log: ' + require('util').inspect(browserLog));

        browserLog.level.value: 900  
browserLog.level.name: 'WARNING'  
browserLog.message.message.level: 'info'  

    
  });

 

});