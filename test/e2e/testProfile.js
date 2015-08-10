describe('Premi Profile page test', function(){


	it('should change the password',function(){
          //effettuo la login e poi accedo alla home
          browser.get('http://localhost:8081/#/login');
          element(by.model('user.username')).sendKeys('test');
          element(by.model('user.password')).sendKeys('password');
          element( by.css('[ng-click="login()"]')).click();
		//premo il pulsante nuova presentazione	
		element( by.css('[ng-click="goProfile()"]')).click();

		element(by.css('[ng-click="editPassword = !editPassword"]')).click();
		element(by.model('user.password')).sendKeys('password');
		element(by.model('user.newpassword')).sendKeys('newpassword');
		element(by.model('user.confnewpassword')).sendKeys('newpassword');
        //verifico che la presentazione sia stata creata correttamente
        element(by.css('[ng-click="editPassword = editPassword"]')).click();
        var message = element(by.binding('message'));
        expect(message.getText()).toEqual('Password modificata con successo');

    });

	it('should restore the previous password',function(){
		element(by.model('user.password')).clear();
		element(by.model('user.newpassword')).clear();
		element(by.model('user.confnewpassword')).clear();

       	element(by.model('user.password')).sendKeys('newpassword');
		element(by.model('user.newpassword')).sendKeys('password');
		element(by.model('user.confnewpassword')).sendKeys('password');
        //verifico che la presentazione sia stata creata correttamente
        element(by.css('[ng-click="editPassword = editPassword"]')).click();
        var message = element(by.binding('message'));
        expect(message.getText()).toEqual('Password modificata con successo');
        
	});

});